const BASE_URL = 'https://jsonplace-univclone.herokuapp.com';

let fetchUsers = () => fetchData(`${BASE_URL}/users`);

let renderUser = (user) => {
  return $(
    `<div class="user-card">
    <header>
      <h2>${user.name}</h2>
    </header>
    <section class="company-info">
      <p><b>Contact:</b> ${user.email}</p>
      <p><b>Works for:</b> ${user.company.name}</p>
      <p><b>Company creed:</b> ${user.company.catchPhrase}, 
      which will ${ user.company.bs }!"</p>
    </section>
    <footer>
      <button class="load-posts">POSTS BY ${user.username}</button>
      <button class="load-albums">ALBUMS BY ${user.username}</button>
    </footer>
    </div>`).data('user', user);
}

let renderUserList = (userList) => {
  $('#user-list').empty();
  userList.forEach((user) => $('#user-list').append(renderUser(user)));

}

let bootstrap = () => fetchUsers().then(renderUserList);

bootstrap();

$('#user-list').on('click', '.user-card .load-posts', function () {
  const user = $(this).closest('.user-card').data('user');
  fetchUserPosts(user.id).then(renderPostList)
});

$('#user-list').on('click', '.user-card .load-albums', function () {
  const user = $(this).closest('.user-card').data('user');
  fetchUserAlbumList(user.id).then(renderAlbumList)
});

let fetchUserAlbumList = (userId) => fetchData(`${BASE_URL}/users/${userId}/albums?_expand=user&_embed=photos`);

let renderAlbum = (album) => {
  let albumCardElements = $(`<div class="album-card">
  <header>
    <h3>${album.title}, by ${album.user.username}</h3>
  </header>
  <section class="photo-list">
  </section>
</div>`);

  album.photos.forEach((photo) => $('.photo-list').append(renderPhoto(photo)));

  return albumCardElements;
}

let renderPhoto = (photo) => {
  return $(`<div class="photo-card">
  <a href="${photo.url}" target="_blank">
    <img src="${photo.thumbnailUrl}">
    <figure>${photo.title}</figure>
  </a>
</div>`)
}

let renderAlbumList = (albumList) => {
  $('#app section.active').removeClass('active');
  $('#album-list').addClass('active').empty();

  albumList.forEach((album) => $('#album-list').append(renderAlbum(album)));
}

function fetchData(url) {
  return fetch(url).then(resp => resp.json())
    .catch(function (error) {
      console.error('fetch data error')
    })
}

let fetchUserPosts = (userId) => fetchData(`${BASE_URL}/users/${userId}/posts?_expand=user`);

let fetchPostComments = (postId) => fetchData(`${BASE_URL}/posts/${postId}/comments`);

let setCommentsOnPost = (post) => {
  if (post.comments) {
    return Promise.reject(null);
  }

  return fetchPostComments(post.id)
    .then(function (comments) {
      post.comments = comments;
      return post;
    });
}

let renderPost = (post) => {
  return $(`<div class="post-card">
  <header>
    <h3>$${post.title}</h3>
    <h3>--- ${post.user.username}</h3>
  </header>
  <p>${post.body}</p>
  <footer>
    <div class="comment-list"></div>
    <a href="#" class="toggle-comments">(<span class="verb">show</span> comments)</a>
  </footer>
</div>`).data('post', post)
}

let renderPostList = (postList) => {
  $('#app section.active').removeClass('active');
  $('#post-list').empty().addClass('active')
  postList.forEach((post) => $('#post-list').append(renderPost(post)));
}

let toggleComments = (postCardElement) => {
  const footerElement = postCardElement.find('footer');

  if (footerElement.hasClass('comments-open')) {
    footerElement.removeClass('comments-open');
    footerElement.find('.verb').text('show');
  } else {
    footerElement.addClass('comments-open');
    footerElement.find('.verb').text('hide');
  }
}

$('#post-list').on('click', '.post-card .toggle-comments', function () {
  const postCardElement = $(this).closest('.post-card');
  const post = postCardElement.data('post');
  const postCardComments = postCardElement.find('.comment-list');

  setCommentsOnPost(post)
    .then(function (post) {
      postCardComments.empty();
      post.comments.forEach((comment) => 
      postCardComments.prepend(`<h3> ${comment.body} --- ${comment.email} </h3>`))
      toggleComments(postCardElement);
    })
    .catch(function () {
      toggleComments(postCardElement);
    });
});