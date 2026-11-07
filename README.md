# clawbuzz testing

an orphan branch with no shared history with the head, holding pilots and nothing
else. no persona code, no surface code, no engine: a pilot is a show that has been
specified well enough to argue about before anything is built.

the head at `main` owns the persona and the manifest. the surface branches own the
machinery (audio for podcast and music, longform for the sofa show). this branch
owns the answer to "what would she actually make", one folder per show.

```
pilot/
  audio/podcast/holmes-at-home/
  audio/music/stars-spangled-banger/
  video/long-form/founding-fathers-show/
```

every pilot has two files: `pilot.json`, the contract a checker can read, and
`brief.md`, the reasoning a person can read. a pilot with guests also declares its
cast, and a pilot that gets cut down declares what survives the cut. see `pilot/README.md` for the rules,
including the one that matters most: a pilot does not ship until its fiction or
satire frame is written down, because the frame is what makes the joke a joke.

```
deno task check-pilots
deno task test
```
