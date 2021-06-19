"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
    storyList = await StoryList.getStories();
    $storiesLoadingMsg.remove();

    putStoriesOnPage();
    if (currentUser !== undefined) {
        addClickFav()
        deleteFav()
        addClickRemove()


    } else {
        // here add a new functions that promtps loggin in and if time gives the option
        $submitStory.hide()
        newStoryTitle.remove()
        newStoryUrl.remove()
    }
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
    //console.debug("generateStoryMarkup", story);
    const star = '&#10025'
    const hostName = story.getHostName();

    return $(`
    <div class="list-item">
      <li id="${story.storyId}">
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
      <button id="favorite" class="star" data-storyId='${story.storyId}'>${star}</button>
     <button id="unfavorite" class="unstar" data-storyId='${story.storyId}'>${star}</button>
     <button id="removeBtn" class='remove' data-storyId='${story.storyId}'>Remove</button>
     </div> 
     
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

async function putStoriesOnPage() {
    console.debug("putStoriesOnPage");

    $allStoriesList.empty();

    // loop through all of our stories and generate HTML for them
    for (let story of storyList.stories) {
        const $story = generateStoryMarkup(story);
        $allStoriesList.append($story);

    }

    $allStoriesList.show();

}

async function CreateNewStoryWithFormInput(formData) {
    // need create the new story pass it to the functions above 
    StoryList.addStory(currentUser, formData)
    const timeOut = setTimeout(() => {
        location.reload()
    }, 1000);
}


async function addClickFav() {
    const btn = $('.star')
    const username = currentUser.username

    btn.on('click', async function(p) {

        const story = p.target.dataset.storyid
        console.log(currentUser.favorites)
        console.log('is favorite')
            // this checks to see if it already in the favortie list and if it is it will delete it
        const isFav = await axios.post(`https://private-anon-6a34d01dfc-hackorsnoozev3.apiary-proxy.com/users/${username}/favorites/${story}`, {
            token: `${currentUser.loginToken}`,
        })
        location.reload()

    })
}

async function deleteFav() {
    const $unfave = $('.unstar')
    const username = currentUser.username
    $unfave.on('click', async function(u) {
        const story = u.target.dataset.storyid
        console.log('unfave works')
        const del = await axios({
            url: `https://private-anon-240ddd2cfd-hackorsnoozev3.apiary-proxy.com/users/${username}/favorites/${story}`,
            method: 'delete',
            params: { token: currentUser.loginToken },
        })
        location.reload()

    })
}


async function addFavList() {
    //hide the nornal list and create a list using the fave
    $allStoriesList.hide()
        // create new list with favs
    const $favStoryList = $('#fav-list')
    const favs = currentUser.favorites

    for (let i of favs) {
        let favStory = generateStoryMarkup(i)
        $favStoryList.append(favStory)
    }
}

$favsBtn.on('click', addFavList);

function addClickRemove() {
    const $btn = $('.remove')
    const token = currentUser.loginToken
    $btn.on('click', async function(r) {
        const thisStoryId = r.target.dataset.storyid
        const li = r.target.parentNode
        StoryList.removeStory(thisStoryId, token)
        li.remove()
    })
}

// inifite scroll
const $container = $('.stories-container container')
window.addEventListener('scroll', () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement
    if (scrollTop + clientHeight > scrollHeight - 5) {
        moreStories()
    }
})

async function moreStories() {
    const stories = await StoryList.getStories()
    const newList = stories.stories
    for (let i of newList) {
        const newMarkUp = generateStoryMarkup(i)
        $allStoriesList.append(newMarkUp)
    }
}