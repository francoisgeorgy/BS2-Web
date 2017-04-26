# User Interface

The UI will try to emphasize the signal flow (sound path). It is not important to reproduce the layout of the hardware BS2. 

## Main parts

- Oscillators
    - Osc. 1
    - Osc. 2
    - Sub osc.
- Low Frequency Oscillators (LFO)
- Mixer
- Filter
- Envelopes
    - Amp envelope
    - Mod envelope
- Effects
- Portamento
- Arpeggiator

## Libs used

- jQuery Knob: http://anthonyterrien.com/knob/ (https://github.com/aterrien/jQuery-Knob)
- ~~Nexus UI : https://github.com/lsu-emdm/nexusUI~~
- JS Storage: https://github.com/julien-maurel/js-storage

### jQuery Knob issues

https://github.com/aterrien/jQuery-Knob/pull/242

# Ideas

Routing matrix:

                 Osc1        Osc2     Filter  
              Pitch  PW   Pitch  PW    Freq   
    Sub Osc     +           +      
    LFO 1       X           X
    LFO 2            X           X     +/- X
    Osc 2                                X
    Mod Env     X    X      X    X       X

Modulation source:

