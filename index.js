/**
 * This is a promise-based function that connects to the Hacker News API to fetch the latest top stories.
 * It then returns an object list of all the articles hydrated with the necessary "item" data as specified
 * in the item endpoint
 * @returns {Promise<object[]>}
 */
async function hackernewsTopStories() {
    // resolves into a promise that will fetch hydrated articles from hacker news api
    return new Promise((resolve, reject) => {
        const url = `https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`

        fetch(url)
            .then(response => response.json())
            .then(ids => {
                // The topstories.json endpoint returns a list of ids
                // foreach id we need to call the item.json api and get the actual item object.
                const itemPromises = [] // will store the promises that will fetch the item object for the specified id

                Array.from(ids).forEach(id => {
                    const promise = new Promise(resolve1 => {
                        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
                            .then(response => response.json())
                            .then(item => resolve1(item))
                            .catch(err => Error('Could not fetch item'))
                    }) // create a promise to fetch the item information for this id

                    itemPromises.push(promise) // save this promise in the array
                })

                // at this point we have all the promises for item fetching
                // now we are going to execute all of the at once
                // we will only get data once ALL of those promises are resolved
                Promise.all(itemPromises).then(items => resolve(items), err => reject(err))
            })
            .catch(err => reject(err))
    });
}

/**
 * Builds the HTML markup to be used to display articles
 * @param articles
 * @returns {string|string}
 */
function articlesMarkup(articles) {
    return articles.length ? articles.map(article => {
            return `
<article>
    <h5>${article.title} <small><span class="badge badge-danger">${article.by}</span></small></h5>
    <p class="text-muted small text-light"><a href="${article.url}" target="_blank">${article.url}</a></p>
</article>  `
        }).join('')
        :
        `
<p>There are no articles to display</p>
`
}

document.addEventListener('DOMContentLoaded', function() {
    const refreshButton = document.querySelector('.topstories')

    refreshButton.addEventListener('click', function() {
        const target = document.querySelector('div#articles')

        this.disabled = true // disable the button
        target.innerHTML = '<p>Loading data. Please wait...</p>'

        hackernewsTopStories().then(data => {
            // at this point we have all the item information we require and we can proceed to display it on the page
            target.innerHTML = articlesMarkup(data)
        }, err => {
            console.log(err)
            target.innerHTML = `<p>${err.statusText}</p>`
        }).finally(() => {
            this.disabled = false // re-enable the button when done
        })
    })
})