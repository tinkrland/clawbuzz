# coverage: static

| piece | status | what it means |
| --- | --- | --- |
| plate spec | working (ported) | proskena scene state, subject null, light rig from the recipe |
| camera projection | working (ported) | room geometry to placement, bytes unchanged from the stage work |
| sets and light recipes | working (ported) | authored rooms, backdrops, key/fill/rim, person stage scale |
| frame families | working (ported) | square, portrait, vertical, wide, pin, plus the 14% vertical bands |
| composite and overlay builders | working (ported) | ffmpeg argument builders, no process spawned in tests |
| stills | working | frame, plate, caption band, person null |
| carousels | working | cover plus one idea per slide, alt text required, word ceiling, cta and emoji policy |
| persona wiring | working | art direction register, brief, memory scope, publishing gate |
| plate renderer | partial | `renderPlateCmd` names `scripts/render_plate.py`; the script and prop assets are not on this branch |
| person compositing | designed | the composite builders are here, the masky clip is not |
| posting | planned | the gate refuses by default, no adapter |

renderer note: a still reports `subject: null` by design. the person is a
composited layer, never part of the plate.

tests: `deno task test`. the ported suites run unchanged.
