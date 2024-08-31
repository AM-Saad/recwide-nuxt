<template>
   <div>
      <div
v-if="projects.length > 0"
class="content grid g-three p-large">
         <Project
v-for="project in projects"
:key="project._id" :project="project" />
         <router-link
to="/recorder"
class="project new-project">
            <div class="button">Create New Project</div>
         </router-link>
      </div>

      <div v-if="projects.length == 0">
         <div class="content grid g-three p-large">
            <router-link
to="/recorder"
class="project new-project">
               <div class="button">Create New Project</div>
            </router-link>
         </div>
      </div>
   </div>
</template>

<script setup>
import Project from "@/modules/user/components/Project.vue"
</script>

<style>
.project {
   position: relative;
   padding: var(--m-padding);
   border-radius: var(--m-radius);
   background-color: #fff;
   border: 1.2px solid #eee;
   box-shadow: var(--shadow3);
   z-index: 99;
   border-top-left-radius: 0;
}

.project::before {
   content: "";
   position: absolute;
   left: -2px;
   top: -21px;
   width: 40%;
   height: 20px;
   background-color: inherit;
   border: inherit;
   border-top-right-radius: 19px;
   border-bottom: 0;
   box-shadow: -3px -4px 9px 0px rgba(53, 42, 42, 0.11);
}

.project-icon {
   height: 30px;
}

.project-mode {
   height: 25px;
   filter: grayscale();
}

.project-title {
   margin: var(--m-margin) 0;
   font-size: 17px;
   color: #444;
}

.project-date {
   display: block;
   color: #555;
   text-align: right;
   font-size: 13px;
   letter-spacing: 0.2px;
}

.new-project {
   border: 1.8px dashed rgb(211, 211, 211);
   background-color: #f2f2f2;
}

.new-project .button {
   background-color: #4e7ef8;
   padding: var(--m-padding) 7px;
   position: absolute;
   top: 60%;
   left: 50%;
   -webkit-transform: translate(-50%, -60%);
   transform: translate(-50%, -60%);
   border-radius: var(--s-radius);
   color: #fff;
   font-size: 11px;
}

.new-project .button:hover {
   background-color: #618cfa;
}
</style>
