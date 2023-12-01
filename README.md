# Atlasphere
Progressive web application and platform for location-based publishing:
[https://atlasphere.app](https://atlasphere.app)

Atlasphere is a viewing and authoring platform for writing per-location
articles associated with a geoposition. It uses Google Maps (or Mapbox) for displaying
the locations associated with writing posts, and leverages the
[Elix](https://component.kitchen/elix) web components library for its user 
interface and overall architecture.

Atlasphere is implemented as a web application, with a PWA front-end and an
API+database+AWS back-end.

A series of [demonstrations](https://atlasphere.app/demo) illustrate the 
potential uses for Atlasphere. Note that on wide screens, the demonstrations 
are live instances of the web app running within the context of the web page.

You can see my own writing and usage at 
[https://atlasphere.app?tag=@robbearman](https://atlasphere.app?tag=@robbearman).

## Build

### Pre-Commit

The project uses [pre-commit](https://pre-commit.com/) to ensure linting, formatting, and others pass before committing.

[Install pre-commit on your machine](https://pre-commit.com/#installation) then initialize it once for this repository:

```shell
pnpm pre-commit-install
```

Now upon every commit the `pre-commit` rules are checked. You can trigger them manually by running:

```shell
pnpm pre-commit-run
```

If it's necessary, you can skip the pre-commit hooks via:

```shell
git commit --no-verify -m "..."
```

### Google Maps JavaScript API

API keys are provided for the [atlasphere.app](https://atlasphere.app) and 
[testatlasphere.herokuapp.com](https://testatlasphere.herokuapp.com)
URLs. These keys are protected such that they work only when referred
by the respective URL.

You will need to generate your own Google Maps JavaScript API key for
local development. Create a module in `server/google-api-key/dev.js`,
similar to one of the `production.js` or `test.js` modules, but using
your own account's API key.

You will need to do the same for Mapbox API keys.

### Local, test, and production builds

#### Environment variables

These environment variables need to be set on Heroku servers:

`NODE_ENV` is set to `test` or `production`. If not set, `NODE_ENV` defaults to `dev`.

We also set `NODE_MODULES_CACHE` to `false` on Heroku servers to force a fresh fetch of npm modules.

`ATLASPHERE_MARKER_RESOURCE_BASE_URL` is set to an AWS S3 bucket path such as `https://atlasphere.s3.amazonaws.com/`.
Note the trailing slash. If `ATLASPHERE_MARKER_RESOURCE_BASE_URL` is not set, then the path
is assumed to be `''`. For development enviroments, that would require you have a tree of accounts
set up under `<git_project_root>/client/accounts`.

`MONGODB_CONNECTION` is set to a MongoDB connection string.

`ATLASPHERE_API_KEY` is set for making API calls to the Atlasphere servers.

For local builds and testing, you can set environment variables through a `.env` file at the project
root. See `<git_project_root>/.env.example` for an example of pointing to your own AWS S3 bucket.
You'll need to set up the bucket to be a publicly-accessible static website,
including a bucket policy that looks like:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::<your_bucket_name>/*"
        }
    ]
}
```

You'll also need to set the CORS configuration to:

```
<?xml version="1.0" encoding="UTF-8"?>
<CORSConfiguration xmlns="http://s3.amazonaws.com/doc/2006-03-01/">
<CORSRule>
    <AllowedOrigin>*</AllowedOrigin>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedHeader>*</AllowedHeader>
</CORSRule>
</CORSConfiguration>
```

#### Server build command

For local builds **after you have created your Google/Mapbox Map API `dev.js`** files, run
from the project directory 

```
npm run build
```

This will make a copy of the `devkey.js` file in the appropriate place.
Similarly, the Heroku server builds are configured to build with the
`NODE_ENV` environment variable set to `production` or `test`.

## Runtime

You can the launch the server from the project directory 

```
npm run start
``` 
in order to run a local server on http://locahost:5000.

## Content

Account management, APIs, and content storage are all currently under development.
What is in place right now is content storage/retrieval through a content tree contained
in an AWS S3 bucket, or through a file tree stored locally on your development machine.
This system will evolve as account management and the database infrastructure is developed.

It’s important to understand that the server picks up content through the
`ATLASPHERE_MARKER_RESOURCE_BASE_URL` environment variable. If you want to work
against locally-stored content, leave that environment variable set to the empty string,
and store your content tree under `client/accounts/`. Note that this directory is 
listed in the `.gitignore` file.

The content structure looks like the following for both S3 buckets and local dev machine storage:

```
accounts
|
-- markers.json
-- markerIndexes.json
-- user1
   |
   -- markers.json
   -- profile.jpg
   -- profile-20x20.jpg
   -- html
      |
      -- <posting html files>
   -- images
      -- <posting image folders>
-- user2
<etc>
```

You generate new content manually by using the `tasks/createNewMarker.js` utility.
This creates a new entry in a user account’s markers.json (the user account folder must
already exist), along with an associated html template file and empty image folder. You 
create content by editing the new `markers.json` file, the html file, and adding image
jpg files to the image directory. Obviously, a web interface will be built eventually to allow
users to provide new content.

Before running `tasks/createMarker.js`, make sure you have an client/accounts tree locally
with the user id folder already created. You need to populate the user id folder with a
profile image jpg file and a 20x20 pixel version of the image jpg. You also need an
initial `markers.json` file initialized to `[]`.

Once you have content, you can copy that manually to an S3 bucket having the same folder structure.

The Atlasphere server and front-end make use of index files built from the stored content, particularly
the user’s `markers.json` file. The built index files are stored and retrieved from the
`accounts/` folder - whether local or on S3. The `tasks/buildMarkers.js` utility generates
these files, `markers.json` and `markerIndexes.json`, by crawling over the local or S3 paths
(which you specify in the command line `--path` argument) and storing the generated index files
based on the specified path.

When you add new content, it will be picked up by the server automatically on a set time. There
is also a temporary API that allows you to force the endpoint server to refresh its index cache,
but this is not helpful in a load-balanced server environment.

Steps for generating new content:
1. Run `tasks/createMarker.js` with appropriate parameters.
2. Edit the resulting files.
3. Copy the new `markers.json`, html, and images to S3.
4. Run `tasks/buildMarkers.js` with appropriate parameters.

The complexity of all of the above shrinks as back-end functionality is built out.

## Service Worker

The app runs with a service worker, with code provided by 
[Google's Workbox](https://developers.google.com/web/tools/workbox/)
toolset. You'll need to install the workbox cli:

```
npm install -g workbox-cli
```

Anytime logic is changed in the app, you'll need to regenerate the
`service-worker.js` by making any necessary modifications in `workbox-config.js` and running:

```
npm run buildsw
```

Note that the generated `service-worker.js` file is committed to git.

Content changes, such as a modification to an html file or the addition of
a new marker item (map site) does not require the build of a new
service worker. Generate a new service worker for the site only when
a modification of the app logic itself needs to be distributed.