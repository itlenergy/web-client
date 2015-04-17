ITL Web Client
==============

This project provides a simple management interface to the ITL API server.  It is implemented as a [Node.JS](https://nodejs.org/) application in [ES6 (ECMAScript 6)](http://babeljs.io/docs/learn-es6/), with `async`/`await` support to improve readibility.

Since Node.JS and the browser run ES5 (plain old JavaScript) mostly, there is a build process.

For convenience, the application is packaged as a [Docker](https://www.docker.com/) container and published on [Docker Hub](https://registry.hub.docker.com/u/itlenergy/web-client/).


Prerequisites
-------------

If you want to build this project, you will need to download and install [Node.JS](https://nodejs.org/) and [Docker](https://docs.docker.com/installation/#installation).

The project also uses [Grunt](http://gruntjs.com/) to build, which you can install via Node Package Manager (NPM, installed with Node.JS) using:

    $ sudo npm install -g grunt-cli


Building
--------

Once you've cloned the repository from github, you should install the project dependencies:

    $ npm install
    
Then building the project is as simple as:

    $ grunt

If you also want to build the docker container, run

    $ docker build -t itlenergy/web-client .


Running
-------

### running the script

You can run the application locally without using docker.  The main server program is `index.js` in the route of the project.  It takes a few command line parameters, which you can read more about by running:

    $ ./index.js --help
    
      Usage: index [options]

      Options:

        -h, --help         output usage information
        -V, --version      output the version number
        --config [file]    Reads these options from a config JSON file
        --listen [value]   Listen on port or socket [3001]
        --api-url [value]  The URL of the web API

So for example, if your API is at `http://mydomain.com/api`, and you want it to listen on port 80, then you'd run:

    $ ./index.js --listen 80 --api-url "http://mydomain.com/api"

Alternatively, you can specify the options in a configuration file.  Note that the option names are camel-cased.  E.g., the following `config.json` contains the same options as above:

    {
      "listen": 80,
      "apiUrl": "http://mydomain.com/api"
    }

Then you'd run the application with:

    $ ./index.js --config config.json

That's all there is to running the server.


### running using docker

You can also run the application as a docker container.

The docker container expects there to be a configuration file called `config.json` in the container's `/host` directory, and it outputs a log to `/host/node.log`.  Running the container then looks like this:

    $ docker run -d --name itlenergy-web -v /path/to/config/dir:/host -p 3000:80 itlenergy/web-client
    
This will automatically download it from docker hub and run it for you.  I'll break the command down:

 * `docker run` - run the specified image name, download it if necessary
 * `-d` - run it in the background (`d` for `daemon`)
 * `--name` - give it a name (doesn't matter what you call it)
 * `-v /path/to/config/dir:/host` - mount the specified directory as `/host` - the directory should be fully qualified and contain the `config.json` file
 * `-p 3000:80` - publish the port - the first number is the port number you want to forward it to on the host, and the 2nd number should be the port the application is running on (i.e. the one you specified in the `config.json`)
 * `itlenergy/docker` - the name of the image on docker hub to run
 

### other configuration hints

To expose the running container to the outside world, you should use something like `nginx`.  Below is an example config file (assuming you exposed the port to `3000` on the host):

    server {
      listen 80;
      server_name client.mydomain.com;
      error_log /home/itlenergy/nginx-error.log;

      location / {
        proxy_pass http://127.0.0.1:3000$request_uri;
        proxy_set_header Host $http_host;
      }
    }

To restart the container if it or the host server goes down, you'll want an upstart job like the following:

    description "ITLEnergy web client"

    start on filesystem
    stop on runlevel [!2345]

    respawn

    script
      /usr/bin/docker start -a itlenergy-web
    end script

Here, `docker start` starts a container previously created using `docker run`.
