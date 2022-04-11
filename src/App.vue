<script setup>
  import { Authenticator } from '@aws-amplify/ui-vue';
  import '@aws-amplify/ui-vue/styles.css';
  import FileInput from 'vue3-simple-file-input'

  import Amplify, { API } from 'aws-amplify';
  import awsconfig from './aws-exports';

  import { ref, computed } from 'vue'

  // Components
  import DropZone from './components/DropZone.vue'
  import FilePreview from './components/FilePreview.vue'

  // File Management
  import useFileList from './compositions/file-list'
  const { files, addFiles, removeFile } = useFileList()

  var fileData = ref()
  var apiRes = ref('000')

  function onInputChange(e) {
    // console.log(e.target.files[0])
    // console.log(response)
    addFiles(e.target.files)
    const fileReader = new FileReader()
    fileReader.readAsText(e.target.files[0])
    fileReader.onload = (event) => {
        // console.log(event.target.result)
        fileData.value = event.target.result
    }
    e.target.value = null // reset so that selecting the same file again will still cause it to fire this change
  }

  const uploadedFileData = computed(() => {
    return fileData
  })

  const apiResponse = computed(() => {
    return apiRes
  })

  // Uploader
  import createUploader from './compositions/file-uploader'
  const { uploadFiles } = createUploader('YOUR URL HERE')

  Amplify.configure(awsconfig);

  Amplify.configure({
    // OPTIONAL - if your API requires authentication 
    Auth: {
        // REQUIRED - Amazon Cognito Identity Pool ID
        identityPoolId: 'ap-southeast-2:02c40c22-efea-4897-942c-770ee5e5b4da',
        // REQUIRED - Amazon Cognito Region
        region: 'ap-southeast-2',
    },
    API: {
        endpoints: [
            {
                name: "Ops Backend API",
                endpoint: "https://io2d8afghd.execute-api.ap-southeast-2.amazonaws.com"
            }
        ]
    }
  })

  const submit = async (user) => {
    console.log(uploadedFileData.value._rawValue)
    const apiName = 'Ops Backend API';
    const path = '/prod/orders';
    const myInit = {
        body: {
          "data": uploadedFileData.value._rawValue
        },
        headers: {
          Authorization: `${user.signInUserSession.idToken.jwtToken}`
        },
    };
    apiRes.value = await API.post(apiName, path, myInit)
    console.log(apiRes)
  }

</script>

<template>
  <authenticator>
    <template v-slot="{ user, signOut }">
      <h1>Hello {{ user.username }}!</h1>
      <!-- <p>Please upload the order file</p> -->
      <!-- <pre style=""><code id="json-container">{{user}}</code></pre> -->
      <!-- <button @click="submit(user)">Submit</button> -->
      <!-- <input ref="orderFile" v-on:change="getFileData(evt)" style="margin:12px;" type="file"> -->
      <!-- <input ref="orderFile" style="margin:12px;" type="file"> -->
      <!-- <file-input :v-model="orderFile" id="form"></file-input> -->

      <DropZone class="drop-area" @files-dropped="addFiles" #default="{ dropZoneActive }">
        <label for="file-input">
          <span v-if="dropZoneActive">
            <span>Drop Them Here</span>
            <span class="smaller">to add them</span>
          </span>
          <span v-else>
            <span>Drag Your Files Here</span>
            <span class="smaller">
              or <strong><em>click here</em></strong> to select files
            </span>
          </span>

          <input type="file" id="file-input" multiple @change="onInputChange" />
        </label>
        <ul class="image-list" v-show="files.length">
          <FilePreview v-for="file of files" :key="file.id" :file="file" tag="li" @remove="removeFile" />
        </ul>
      </DropZone>

		  <!-- <button @click.prevent="uploadFiles(files)" class="upload-button">Upload</button> -->

      <!-- <button @click="submit(user)" @click.prevent="uploadFiles(files)" class="upload-button">Upload</button> -->
      <button @click="submit(user)" class="upload-button">Upload</button>
      <button @click="signOut" class="upload-button">Sign Out</button>

      <h2>Response:</h2>

      <!-- <p ref="content">{{uploadedFileData}}</p> -->

      <pre ref="content"><code id="json-container">{{apiResponse}}</code></pre>

      <!-- <div style="margin:24px;">
        <button @click="submit(user)">Submit</button>
      </div> -->
      <!-- <div style="margin:24px;">
        <button @click="signOut">Sign Out</button>
      </div> -->
    </template>
  </authenticator>
</template>

<style lang="stylus">
html {
	height: 100%;
	width: 100%;
	background-color: #b6d6f5;
	/* Overlapping Stripes Background, based off https://codepen.io/MinzCode/pen/Exgpqpe */
	--color1: rgba(55, 165, 255, 0.35);
	--color2: rgba(96, 181, 250, 0.35);
	--rotation: 135deg;
	--size: 10px;
	background-blend-mode: multiply;
	background-image: repeating-linear-gradient(
			var(--rotation),
			var(--color1) calc(var(--size) * 0),
			var(--color1) calc(var(--size) * 9),
			var(--color2) calc(var(--size) * 9),
			var(--color2) calc(var(--size) * 12),
			var(--color1) calc(var(--size) * 12)
		),
		repeating-linear-gradient(
			calc(var(--rotation) + 90deg),
			var(--color1) calc(var(--size) * 0),
			var(--color1) calc(var(--size) * 9),
			var(--color2) calc(var(--size) * 9),
			var(--color2) calc(var(--size) * 12),
			var(--color1) calc(var(--size) * 12)
		);
}
body {
	height: 100%;
	margin: 0;
	padding: 0;
}
</style>

<style scoped lang="stylus">
#app {
	font-family: Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin: 0 auto;
	height: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
}
.drop-area {
	width: 100%;
	max-width: 800px;
	margin: 0 auto;
	padding: 50px;
	background: #ffffff55;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
	transition: .2s ease;
	&[data-active=true] {
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
		background: #ffffffcc;
	}
}
label {
	font-size: 36px;
	cursor: pointer;
	display: block;
	span {
		display: block;
	}
	input[type=file]:not(:focus-visible) {
		// Visually Hidden Styles taken from Bootstrap 5
		position: absolute !important;
		width: 1px !important;
		height: 1px !important;
		padding: 0 !important;
		margin: -1px !important;
		overflow: hidden !important;
		clip: rect(0, 0, 0, 0) !important;
		white-space: nowrap !important;
		border: 0 !important;
	}
	.smaller {
		font-size: 16px;
	}
}
.image-list {
	display: flex;
	list-style: none;
	flex-wrap: wrap;
	padding: 0;
}
.upload-button {
	display: block;
	appearance: none;
	border: 0;
	border-radius: 50px;
	padding: 0.75rem 3rem;
	margin: 1rem auto;
	font-size: 1.25rem;
	font-weight: bold;
	background: #369;
	color: #fff;
	text-transform: uppercase;
}
button {
	cursor: pointer;
}
</style>