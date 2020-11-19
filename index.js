async function hackernewsTopStories() {
    // resolves into a promise that will fetch hydrated articles from hackern news api
    return new Promise((resolve, reject) => {
        const url = `https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty`

        fetch(url)
            .then(response => response.json())
            .then(ids => {
                const itemPromises = []

                Array.from(ids).forEach(id => {
                    const promise = new Promise(resolve1 => {
                        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json?print=pretty`)
                            .then(response => response.json())
                            .then(item => resolve1(item))
                            .catch(err => Error('Could not fetch item'))
                    })

                    itemPromises.push(promise)
                })

                Promise.all(itemPromises).then(items => resolve(items), err => reject(err))
            })
            .catch(err => reject(err))
    });
}

function articlesMarkup(articles) {
    return articles.length ? articles.map(article => {
            return `
<article>
    <h5>${article.title} <small><span class="badge badge-danger">${article.by}</span></small></h5>
    <p class="text-muted small text-light">${article.title}</p>
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

        // disable the button
        this.disabled = true
        target.innerHTML = '<p>Loading data. Please wait...</p>'

        hackernewsTopStories().then(data => {
            target.innerHTML = articlesMarkup(data)
        }, err => {
            console.log(err)
            target.innerHTML = `<p>${err.statusText}</p>`
        }).finally(() => {
            // re-enable the button when done
            this.disabled = false
        })
    })
})