<template>
  <q-page class="constrain q-pa-md">
    <div class="row q-col-gutter-lg">
      <base-dialog
        :alert="!!error"
        title="Quelque chose ne s'est pas passé comme prévu"
        message="Impossible de charger les publications."
      ></base-dialog>
      <div class="col-12 col-sm-8">
        <q-card
          v-for="post in posts"
          :key="post.id"
          class="card-post q-mb-md"
          flat
          bordered
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <img
                  src="https://images7.alphacoders.com/457/thumb-1920-457534.jpg"
                />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label class="text-bold">Lucas</q-item-label>
              <q-item-label caption>
                {{ post.location }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator />
          <q-img :src="post.imageUrl" basic> </q-img>
          <q-card-section>
            <div>{{ post.caption }}</div>
            <div class="text-caption text-grey">{{ formatedDates }}</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-4 large-screen-only">
        <q-item>
          <q-item-section avatar>
            <q-avatar>
              <img
                src="https://images7.alphacoders.com/457/thumb-1920-457534.jpg"
              />
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-bold">Lucas</q-item-label>
            <q-item-label caption> Rodriguez Lucas </q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </div>
  </q-page>
</template>

<script>
import { date } from "quasar";

export default {
  data() {
    return {
      error: "",
    };
  },
  computed: {
    posts() {
      return this.$store.getters["profile/posts"];
    },
    formatedDates() {
      const data = this.$store.getters["profile/posts"];
      for (const key in data) {
        return date.formatDate(data[key].date, "D MMMM YYYY", {
          days: [
            "Dimanche",
            "Lundi" /* and all the rest of days - remember starting with Sunday */,
            "mardi",
            "mercredi",
            "jeudi",
            "vendredi",
            "samedi",
          ],

          months: [
            "Janvier",
            "Février",
            "Mars",
            "Avril",
            "Mai",
            "Juin",
            "Juillet",
            "Août",
            "Septembre",
            "Octobre",
            "Novembre",
            "Décembre" /* and all the rest of months */,
          ],
        });
      }
    },
  },
  methods: {
    async loadPosts() {
      try {
        await this.$store.dispatch("profile/loadPosts");
      } catch (error) {
        this.error = error.message || "Something went wrong";
      }
    },
  },
  created() {
    this.loadPosts();
  },
};
</script>

<style lang="sass" scoped>
.card-post
  .q-img
    min-height: 200px
</style>
