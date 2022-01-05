import axios from "axios";

export default {
  namespaced: true,
  state() {
    return {
      posts: []
    };
  },
  mutations: {
    stockPost(state, payload) {
      state.posts = payload;
    },
    newPost(state, payload) {
      state.posts.push(payload);
    }
  },
  actions: {
    async loadPosts(context) {
      const response = await axios.get(`${process.env.API}/posts`);
      const posts = [];

      for (const key in response.data) {
        const post = {
          caption: response.data[key].caption,
          date: response.data[key].date,
          imageUrl: response.data[key].imageUrl,
          location: response.data[key].location
        };
        posts.push(post);
      }
      context.commit("stockPost", posts);
    },
    addPost(context, payload) {
      let formData = new FormData();
      formData.append("id", payload.id);
      formData.append("caption", payload.caption);
      formData.append("location", payload.location);
      formData.append("picture", payload.picture);
      formData.append("date", payload.date);

      axios
        .post(`${process.env.API}/createPost`, formData)
        .then(response => {
          console.log(response);
        })
        .catch(error => {
          console.log(error);
        });
      context.commit("newPost", formData);
    }
  },
  getters: {
    posts(state) {
      return state.posts;
    }
  }
};
