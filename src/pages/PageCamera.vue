<template>
  <q-page class="constrain-more q-pa-md">
    <base-dialog
      :alert="locError"
      title="Quelque chose ne s'est pas passé correctement"
      message="Lucastagram n'as pas pu accéder a votre position"
    ></base-dialog>
    <div class="camera-frame q-pa-md">
      <video
        v-show="!imageCaptured"
        ref="video"
        class="full-width "
        autoplay
        playsinline
      />
      <canvas
        v-show="imageCaptured"
        ref="canvas"
        class="full-width"
        height="200"
      />
    </div>
    <div class="row justify-center q-gutter-sm q-pa-md">
      <q-btn
        v-if="hasCamera"
        @click="captureImage"
        color="grey-10"
        icon="eva-camera"
        size="lg"
        round
        unelevated
      />
      <div class="image-upload">
        <label for="file-input">
          <q-icon
            class="circle-icon"
            size="lg"
            color="white"
            name="eva-image-outline"
          />
        </label>
        <input v-on:change="getImage" id="file-input" type="file" />
      </div>
    </div>
    <div class="row justify-center q-ma-md">
      <q-input
        v-model="caption"
        class="col col-sm-6"
        label="Description"
        dense
      />
    </div>
    <div class="row justify-center q-ma-md">
      <q-input
        class="col col-sm-6"
        label="Localisation"
        v-model="location"
        dense
      >
        <template v-slot:append>
          <q-btn
            @click="getLocation"
            round
            dense
            flat
            icon="eva-navigation-2-outline"
          />
        </template>
      </q-input>
      <p style="margin-top: 10px; color: red" v-if="formIsValid === false">
        Vous devez au moins ajouter une photo pour votre post.
      </p>
    </div>

    <div class="row justify-center q-mt-lg">
      <q-btn
        @click="addPost()"
        unelevated
        rounded
        color="primary"
        label="Publier"
      />
    </div>
  </q-page>
</template>

<script>
import { uid } from "quasar";
import BaseDialog from "src/components/BaseDialog.vue";
require("md-gum-polyfill");
export default {
  components: { BaseDialog },
  data() {
    return {
      id: uid(),
      caption: "",
      location: "",
      picture: null,
      date: Date.now(),
      imageCaptured: false,
      hasCamera: true,
      uploadImage: null,
      locError: false,
      formIsValid: true
    };
  },
  methods: {
    addPost() {
      this.formIsValid = true;
      if (this.picture === null) {
        this.formIsValid = false;
        return;
      }
      this.$store.dispatch("profile/addPost", {
        id: this.id,
        caption: this.caption,
        location: this.location,
        picture: this.picture,
        date: this.date
      });
      this.$q.notify({
        message: "Post créer.",
        actions: [
          {
            label: "Dismiss",
            color: "white"
          }
        ]
      });
      this.$router.replace("/");
    },
    initCamera() {
      navigator.mediaDevices
        .getUserMedia({
          video: true
        })
        .then(stream => {
          this.$refs.video.srcObject = stream;
        })
        .catch(error => {
          this.hasCamera = false;
        });
    },
    captureImage() {
      let video = this.$refs.video;
      let canvas = this.$refs.canvas;
      canvas.width = video.getBoundingClientRect().width;
      canvas.height = video.getBoundingClientRect().height;
      let context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      this.imageCaptured = true;
      this.picture = this.dataURItoBlob(canvas.toDataURL());
      this.disableCamera();
    },
    getImage() {
      const selectedFile = document.getElementById("file-input").files[0];
      this.picture = selectedFile;
      let canvas = this.$refs.canvas;
      let context = canvas.getContext("2d");

      var reader = new FileReader();
      reader.onload = event => {
        var img = new Image();
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
        };
        img.src = event.target.result;
      };
      this.imageCaptured = true;
      reader.readAsDataURL(selectedFile);
      this.disableCamera();
    },
    disableCamera() {
      this.$refs.video.srcObject.getVideoTracks().forEach(track => {
        track.stop();
      });
    },
    getLocation() {
      navigator.geolocation.getCurrentPosition(
        position => {
          this.getCityAndCountry(position);
        },
        err => {
          console.log("err", err);
        },
        { timeout: 7000 }
      );
    },
    getCityAndCountry(position) {
      let apiUrl = `https://geocode.xyz/${position.coords.latitude},${position.coords.longitude}?json=1`;
      this.$axios
        .get(apiUrl)
        .then(result => {
          this.locationSucces(result);
        })
        .catch(err => {
          this.locationError();
        });
    },
    locationSucces(result) {
      this.location = result.data.city;
      if (result.data.country) {
        this.location += `, ${result.data.country}`;
      }
    },
    locationError() {
      console.log("ON EST LA");
      this.locError = true;
    },
    dataURItoBlob(dataURI) {
      // convert base64 to raw binary data held in a string
      // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
      var byteString = atob(dataURI.split(",")[1]);

      // separate out the mime component
      var mimeString = dataURI
        .split(",")[0]
        .split(":")[1]
        .split(";")[0];

      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);

      // create a view into the buffer
      var ia = new Uint8Array(ab);

      // set the bytes of the buffer to the correct values
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      // write the ArrayBuffer to a blob, and you're done
      var blob = new Blob([ab], { type: mimeString });
      return blob;
    }
  },

  mounted() {
    this.initCamera();
  },
  beforeDestroy() {
    this.disableCamera();
  }
};
</script>

<style lang="sass" scoped>
.camera-frame
  border: 2px solid $grey-10
  border-radius: 10px

.q-field-input
  size: 10px

.image-upload>input
  display: none

.circle-icon
    background: $grey-10
    padding:12.3px
    border-radius: 90%
</style>
