# How to use `nodemon` when running app in docker-chs-development "dev mode"

## What is this about?

For node applications, when you run them in "dev mode" and do a change then this application will be updated by coping over the changed files and  restarting the docker container (see file `Tiltfile.dev` for details)

This is a relatively slow process and can be speeded up by creating a separate docker image that uses `nodemon` to restart the node application (within the docker container) when any files are changed as specified in the `nodemon.conf` file.

Note that this is an *optional* enhancement. If you don't update the `Tiltfile` in  the `docker-chs-development` project then `nodemon` will not be used.

The files in this application that allow `nodemon` to be used are:

- `dev.docker-compose.yaml`
- `dev.dockerfile`
- `nodemon.json`
- `package.json` and `package-lock.json` for additional dev dependencies

## How to use this?

Firstly set the application into 'dev mode'

Then update in the `docker-chs-development` project the `Tiltfile`:

``` shell

'repositories/overseas-entities-web/dev.docker-compose.yaml'
to docker_compose(configPaths = [

and then:
Remove the  include(path = 'repositories/overseas-entities-web/Tiltfile.dev')
```

## Who thought of this?

Dmitry Golubev (dgolubevs)
