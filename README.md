# Nuboard

*A collaborative minimalist latex/math editor, inspired by [muboard](https://muboard.net/).*

## What and why?

I sometimes want to talk to other people and quickly write down some
math when I'm explaining things.
Rather than having other people interpret the unrendered latex, or the
ascii/unicode approximations I would write down, I could of course 
screenshot or screenshot muboard, but it's nicer and less effort
to quickly share a link and type things out live.
Having the entire thing be collaborative based on some CRDT approach
was then simply the natural generalization/implementation of the concept.

## Hacking and deploying

To get up and running, you'll need `yarn` installed.
Then simply run

```sh
yarn install
```

to fill your harddrive with^W^W^W^W install the dependencies.
You can start the development server on <http://localhost:3000>
by running 

```sh
yarn start
```

You can build a release/deploy bundle with 


```sh
yarn run build
```

which should place the files to be deployed in the `dist` directory.

Once the javascript bundle is built, it should be enough to simply
put the contents of `dist` on some static web server.

Since I don't expect more than a few peers to be connected or working
on a single page at any given time, it should work out fine with Yjs'
webRTC connection and hence not need any extra servers (optionally, you
could run and configure some extra signaling server).

## Why is it more complex and heavier?

Starting to use a CRDT inherently brings more complexity than
simply typing in and rendering from a textarea element.
Looking into practical CRDT implementations quickly leads one to 
the Yjs library, which already has bindings for several text editors,
but no bindings for plain textarea or other html elements were to be found.
Rather than spend a lot of time trying to roll my own bindings, I decided
that using one of the existing ones would provide less resistance.

Most of the existing bindings provide a full-blown (and less convenient)
rich-text editor with tendencies towards WYSIWYG, so I tried to take
the least opinionated out of the options to have as stripped down an experience
as I could get, and stay close to the UI spirit of the original muboard.

Needing npm dependencies in this manner anyway, and the bundling and weird
other javascript stuff likely being needed already, I decided it could
be a fun experiment to implement all of this in some framework that didn't
look *too* horrendous.
Note that the entire concept isn't really feasible without javascript, so here we are.
Hence this being implemented in svelte.

## License

Similar to the muboard project by which this was inspired, and
from which some CSS was adapted, this project is licensed under
the MIT license.
See the [LICENSE](./LICENSE) file for the details.

The icon (e.g. the [favicon](./public/favicon.png)) is the cuneiform sign
nu, as a play on the meaning of the word/letter nu.
This was created by Margret Studt and is available under CC BY-SA 2.5
at <https://en.wikipedia.org/wiki/Nu_(cuneiform)#/media/File:B112ellst.png>.
The colors were adapted to be white on blackboard green.
