## ARP and MIDI

From Novation tech support:

    The arp cannot be triggered from an external keyboard, it can only be triggered from the Bass Station keyboard itself.
    Our developers are aware of some users suggesting they'd like to trigger it from an external keyboard.

_FUNCTION_ button + _LATCH_ button:

- **In** : ARP/SEQ will be trigged by external MIDI messages
- **Out**: ARP/SEQ will output MIDI messages when playing


## Patch export
    
    $ xxd -g 1 ../patches/factory-patches/70-127_INIT\ PATCH.syx
    0000000: f0 00 20 29 00 33 00 00 00 00 00 00 00 00 01 00  .. ).3..........
    0000010: 4c 00 00 48 04 04 02 00 02 20 10 10 08 00 01 00  L..H..... ......
    0000020: 43 40 20 00 03 7f 7c 00 00 00 00 00 0f 78 00 00  C@ ...|......x..
    0000030: 08 20 00 00 07 78 00 00 40 00 00 0f 70 00 00 00  . ...x..@...p...
    0000040: 00 00 12 63 10 00 00 00 00 1a 06 20 20 20 04 00  ...c.......   ..
    0000050: 1f 19 10 09 24 02 01 14 40 20 20 10 08 02 01 00  ....$...@  .....
    0000060: 40 40 10 08 04 02 01 00 40 20 00 00 00 03 10 00  @@......@ ......
    0000070: 00 00 00 00 00 00 00 00 00 f7                    ..........
    
    $ xxd -g 1 bs2-patch.syx
    0000000: f0 00 20 29 00 00 00 00 00 00 00 00 00 00 00 00  .. )............
    0000010: 60 00 00 48 04 03 7d 7e 02 20 10 0f 77 78 00 00  `..H..}~. ..wx..
    0000020: 00 00 00 00 00 ff 7c 00 00 00 00 00 0f 78 00 00  ......|......x..
    0000030: 08 20 00 00 07 78 00 00 40 00 00 0f 70 00 00 00  . ...x..@...p...
    0000040: 00 00 12 60 00 00 00 00 00 1a 40 00 20 20 04 00  ...`......@.  ..
    0000050: 1f 19 0f 69 23 79 7c 7e 3f 1f 5f 6f 70 01 7c 7e  ...i#y|~?._op.|~
    0000060: 00 3f 4f 67 70 01 7c 7e 00 1f 40 00 00 00 00 00  .?Ogp.|~..@.....
    0000070: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
    0000080: 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00  ................
    0000090: 00 00 00 00 00 00 00 00 00 f7                    ..........


# Resources

### Icons

- http://fontawesome.io/icons/

### HTML5 storage

- http://opensourceforu.com/2012/04/html5-localstorage-offline-web-applications/
- https://developer.mozilla.org/en-US/docs/Web/API/Storage


# Update gh-pages branch

    git subtree push --prefix src origin gh-pages
    
    