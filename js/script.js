const { of } = rxjs;
const { ajax } = rxjs.ajax;
const { map, catchError } = rxjs.operators;

document.addEventListener("DOMContentLoaded", function () {
  AOS.init();

  const URL_POSTS = "https://jsonplaceholder.typicode.com/posts";
  const URL_USERS = "https://jsonplaceholder.typicode.com/users";
  const SLIDES_CONTAINER = document.querySelector(".glide__slides");
  const BULLETS = document.querySelector(".glide__bullets");
  const NUMBER_POSTS = 4;

  const postsRequest$ = ajax(URL_POSTS).pipe(
    map((resp) => {
      const POSTS = resp.response;
      const firstCommentByUser = filterByFirstPost(NUMBER_POSTS, POSTS);

      return firstCommentByUser;
    }),
    catchError((err) => {
      console.warn("Error getting posts: ", err);
      return of([]);
    })
  );

  postsRequest$.subscribe((posts) => {
    posts.forEach((post) => {
      let user = { id: post.userId, description: post.body };

      getUserById$(user.id).subscribe((name) => {
        user.name = name;

        const SLIDE = `
          <li class="glide__slide">
              <img class="testimonials__img rounded-circle mb-3" src="assets/img/person_${user.id}.jpg" alt="Fotography of a person">
              <p class="testimonials__description font-italic">"${user.description}"</p>
              <span class="testimonials__name">${user.name}</span>    
            <div>
          </li>
        `;

        const BULLED = `
          <button class="glide__bullet" data-glide-dir="=${
            user.id - 1
          }"></button>
        `;

        SLIDES_CONTAINER.innerHTML += SLIDE;
        BULLETS.innerHTML += BULLED;

        new Glide(".glide").mount();
      });
    });
  });

  /**
   * Return first post of a user
   * @param {Number} number_posts Number of posts to return.
   * @param {Array} posts
   */
  const filterByFirstPost = (number_posts, posts) => {
    let userId = 1;
    let postsFiltered = [];

    while (userId <= number_posts) {
      postsFiltered.push(
        posts.find((post) => {
          return post.userId === userId;
        })
      );

      userId++;
    }
    return postsFiltered;
  };

  const getUserById$ = (userId) => {
    return ajax(`${URL_USERS}/${userId}`).pipe(
      map((resp) => resp.response.name),
      catchError((err) => {
        console.warn("Error getting user: ", err);
        return of([]);
      })
    );
  };
});
