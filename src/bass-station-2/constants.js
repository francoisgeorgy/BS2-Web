

export const OSC_RANGES = {
    63: "16'",
    64: "8'",
    65: "4'",
    66: "2'"
};

export const OSC_WAVE_FORMS = [
    "sine", "triangle", "saw", "pulse"   // 0..3
];

export const LFO_WAVE_FORMS = [
    "triangle", "saw", "square", "S+H"  // 0..3
];

export const LFO_SPEED_SYNC = [
    "speed", "sync"     // 0..1
];
/*
export const LFO_SYNC = [
    "64 beats", "48 beats", "42 beats", "36 beats",
    "32 beats", "30 beats", "28 beats", "24 beats",
    "21+2/3", "20 beats", "18+2/3", "18 beats",
    "16 beats", "13+1/3", "12 beats", "10+2/3",
    "8 beats", "6 beats", "5+1/3", "4 beats",
    "3 beats", "2+2/3", "2nd", "4th dot",
    "1+1/3", "4th", "8th dot", "4th trip",
    "8th", "16th dot", "8th trip", "16th",
    "16th trip", "32nd", "32nd trip"
];
*/
export const LFO_SYNC = [
    "64", "48", "42", "36",   // html entities are not supported in SVG text element
    "32", "30", "28", "24",
    "21 ⅔", "20", "18 ⅔", "18",
    "16", "13 ⅓", "12", "10 ⅔",
    "8", "6", "5 ⅓", "4",
    "3", "2 ⅔", "1/2", "1/4.",
    "1 ⅓", "1/4", "1/8.", "1/4 tr",
    "1/8", "1/16.", "1/8tr", "1/16",
    "1/16tr", "1/32", "1/32tr"
];

export const SUB_WAVE_FORMS = [
    "sine", "pulse", "square"
];

export const SUB_OCTAVE = {
    63: "octave -1",
    62: "octave -2"
};

export const FILTER_SHAPES = [
    "low-pass", "band-pass", "hi-pass"
];

export const FILTER_SLOPE = [
    "12dB", "24dB"
];

export const FILTER_TYPE = [
    "classic", "acid"
];

export const ENV_TRIGGERING = [
    "multi", "single", "autoglide"  // 0, 1, 2
];

export const ARP_NOTES_MODE = [
    "up", "down", "up-down", "up-down 2", "played", "random", "play", "record"
];

export const ARP_OCTAVES = [
    1, 2, 3, 4
];

export const ARP_SEQUENCES = [
    '',
    '4 4 4 4  4 4 4 4',  // quarter notes
    '8 r8 8 r8 8 r8 8 r8  8 r8 8 r8 8 r8 8 r8', // eighth notes and eighth rests
    '4 8 r8 4 8 r8  4 8 r8 4 8 8'
    //TODO: to be completed

];

// Mapping 0..255 to -12.0..12.0
export const COARSE_VALUES = [
    -120, // -12.0; -12.00000; 0
    -119, // -11.9; -11.89699; 1
    -118, // -11.8; -11.79398; 2
    -117, // -11.7; -11.69098; 3
    -116, // -11.6; -11.58799; 4
    -115, // -11.5; -11.48498; 5
    -114, // -11.4; -11.38198; 6
    -113, // -11.3; -11.27897; 7
    -112, // -11.2; -11.17596; 8
    -111, // -11.1; -11.07295; 9
    -110, // -11.0; -11.00002; 10
    -109, // -10.9; -10.86696; 11
    -108, // -10.8; -10.76395; 12
    -107, // -10.7; -10.66094; 13
    -106, // -10.6; -10.55794; 14
    -105, // -10.5; -10.45493; 15
    -104, // -10.4; -10.35192; 16
    -102, // -10.2; -10.24894; 17
    -101, // -10.1; -10.14593; 18
    -100, // -10.0; -10.00001; 19
    -100, // -10.0; -10.00001; 20
    -99, // -9.9; -9.93991; 21
    -98, // -9.8; -9.83690; 22
    -97, // -9.7; -9.73390; 23
    -96, // -9.6; -9.63091; 24
    -95, // -9.5; -9.52790; 25
    -94, // -9.4; -9.42490; 26
    -93, // -9.3; -9.32189; 27
    -92, // -9.2; -9.21888; 28
    -91, // -9.1; -9.11587; 29
    -90, // -9.0; -9.00000; 30
    -90, // -9.0; -9.00000; 31
    -89, // -8.9; -8.90988; 32
    -88, // -8.8; -8.80687; 33
    -87, // -8.7; -8.70386; 34
    -86, // -8.6; -8.60086; 35
    -85, // -8.5; -8.49785; 36
    -84, // -8.4; -8.39484; 37
    -83, // -8.3; -8.29186; 38
    -82, // -8.2; -8.18885; 39
    -81, // -8.1; -8.08584; 40
    -80, // -8.0; -8.00002; 41
    -80, // -8.0; -8.00002; 42
    -79, // -7.9; -7.87982; 43
    -78, // -7.8; -7.77682; 44
    -77, // -7.7; -7.67381; 45
    -76, // -7.6; -7.57082; 46
    -75, // -7.5; -7.46782; 47
    -74, // -7.4; -7.36481; 48
    -73, // -7.3; -7.26180; 49
    -72, // -7.2; -7.15879; 50
    -71, // -7.1; -7.05578; 51
    -70, // -7.0; -7.00001; 52
    -70, // -7.0; -7.00001; 53
    -68, // -6.8; -6.84979; 54
    -67, // -6.7; -6.74678; 55
    -66, // -6.6; -6.64378; 56
    -65, // -6.5; -6.54077; 57
    -64, // -6.4; -6.43776; 58
    -63, // -6.3; -6.33478; 59
    -62, // -6.2; -6.23177; 60
    -61, // -6.1; -6.12876; 61
    -60, // -6.0; -6.00000; 62
    -60, // -6.0; -6.00000; 63
    -59, // -5.9; -5.92274; 64
    -58, // -5.8; -5.81974; 65
    -57, // -5.7; -5.71673; 66
    -56, // -5.6; -5.61374; 67
    -55, // -5.5; -5.51074; 68
    -54, // -5.4; -5.40773; 69
    -53, // -5.3; -5.30472; 70
    -52, // -5.2; -5.20171; 71
    -51, // -5.1; -5.09870; 72
    -50, // -5.0; -5.00002; 73
    -50, // -5.0; -5.00002; 74
    -49, // -4.9; -4.89271; 75
    -48, // -4.8; -4.78970; 76
    -47, // -4.7; -4.68670; 77
    -46, // -4.6; -4.58369; 78
    -45, // -4.5; -4.48068; 79
    -44, // -4.4; -4.37767; 80
    -43, // -4.3; -4.27469; 81
    -42, // -4.2; -4.17168; 82
    -41, // -4.1; -4.06867; 83
    -40, // -4.0; -4.00001; 84
    -40, // -4.0; -4.00001; 85
    -39, // -3.9; -3.86266; 86
    -38, // -3.8; -3.75965; 87
    -37, // -3.7; -3.65666; 88
    -36, // -3.6; -3.55366; 89
    -35, // -3.5; -3.45065; 90
    -33, // -3.3; -3.34764; 91
    -32, // -3.2; -3.24463; 92
    -31, // -3.1; -3.14162; 93
    -30, // -3.0; -3.00000; 94
    -30, // -3.0; -3.00000; 95
    -29, // -2.9; -2.93563; 96
    -28, // -2.8; -2.83262; 97
    -27, // -2.7; -2.72962; 98
    -26, // -2.6; -2.62661; 99
    -25, // -2.5; -2.52360; 100
    -24, // -2.4; -2.42059; 101
    -23, // -2.3; -2.31761; 102
    -22, // -2.2; -2.21460; 103
    -21, // -2.1; -2.11159; 104
    -20, // -2.0; -2.00002; 105
    -20, // -2.0; -2.00002; 106
    -19, // -1.9; -1.90558; 107
    -18, // -1.8; -1.80257; 108
    -17, // -1.7; -1.69956; 109
    -16, // -1.6; -1.59658; 110
    -15, // -1.5; -1.49357; 111
    -14, // -1.4; -1.39056; 112
    -13, // -1.3; -1.28755; 113
    -12, // -1.2; -1.18454; 114
    -11, // -1.1; -1.08154; 115
    -10, // -1.0; -1.00001; 116
    -10, // -1.0; -1.00001; 117
    -9, // -0.9; -0.87554; 118
    -8, // -0.8; -0.77254; 119
    -7, // -0.7; -0.66953; 120
    -6, // -0.6; -0.56652; 121
    -5, // -0.5; -0.46351; 122
    -4, // -0.4; -0.36050; 123
    -3, // -0.3; -0.25752; 124
    -2, // -0.2; -0.15451; 125
    -1, // -0.1; -0.05150; 126
    0, // 0.0; 0.00000; 127
    0, // 0.0; 0.00000; 128
    1, // 0.1; 0.05150; 129
    2, // 0.2; 0.15451; 130
    3, // 0.3; 0.25752; 131
    4, // 0.4; 0.36051; 132
    5, // 0.5; 0.46351; 133
    6, // 0.6; 0.56652; 134
    7, // 0.7; 0.66953; 135
    8, // 0.8; 0.77254; 136
    9, // 0.9; 0.87555; 137
    10, // 1.0; 1.00001; 138
    10, // 1.0; 1.00001; 139
    11, // 1.1; 1.08154; 140
    12, // 1.2; 1.18454; 141
    13, // 1.3; 1.28755; 142
    14, // 1.4; 1.39056; 143
    15, // 1.5; 1.49357; 144
    16, // 1.6; 1.59658; 145
    17, // 1.7; 1.69956; 146
    18, // 1.8; 1.80257; 147
    19, // 1.9; 1.90558; 148
    20, // 2.0; 2.00002; 149
    20, // 2.0; 2.00002; 150
    21, // 2.1; 2.11159; 151
    22, // 2.2; 2.21460; 152
    23, // 2.3; 2.31761; 153
    24, // 2.4; 2.42059; 154
    25, // 2.5; 2.52360; 155
    26, // 2.6; 2.62661; 156
    27, // 2.7; 2.72962; 157
    28, // 2.8; 2.83262; 158
    29, // 2.9; 2.93563; 159
    30, // 3.0; 3.00000; 160
    30, // 3.0; 3.00000; 161
    31, // 3.1; 3.14162; 162
    32, // 3.2; 3.24463; 163
    33, // 3.3; 3.34764; 164
    35, // 3.5; 3.45065; 165
    36, // 3.6; 3.55366; 166
    37, // 3.7; 3.65666; 167
    38, // 3.8; 3.75965; 168
    39, // 3.9; 3.86266; 169
    40, // 4.0; 4.00001; 170
    40, // 4.0; 4.00001; 171
    41, // 4.1; 4.06867; 172
    42, // 4.2; 4.17168; 173
    43, // 4.3; 4.27469; 174
    44, // 4.4; 4.37767; 175
    45, // 4.5; 4.48068; 176
    46, // 4.6; 4.58369; 177
    47, // 4.7; 4.68670; 178
    48, // 4.8; 4.78970; 179
    49, // 4.9; 4.89271; 180
    50, // 5.0; 5.00002; 181
    50, // 5.0; 5.00002; 182
    51, // 5.1; 5.09870; 183
    52, // 5.2; 5.20171; 184
    53, // 5.3; 5.30472; 185
    54, // 5.4; 5.40773; 186
    55, // 5.5; 5.51074; 187
    56, // 5.6; 5.61374; 188
    57, // 5.7; 5.71673; 189
    58, // 5.8; 5.81974; 190
    59, // 5.9; 5.92274; 191
    60, // 6.0; 6.00000; 192
    60, // 6.0; 6.00000; 193
    61, // 6.1; 6.12876; 194
    62, // 6.2; 6.23177; 195
    63, // 6.3; 6.33478; 196
    64, // 6.4; 6.43776; 197
    65, // 6.5; 6.54077; 198
    66, // 6.6; 6.64378; 199
    67, // 6.7; 6.74678; 200
    68, // 6.8; 6.84979; 201
    70, // 7.0; 7.00001; 202
    70, // 7.0; 7.00001; 203
    71, // 7.1; 7.05579; 204
    72, // 7.2; 7.15879; 205
    73, // 7.3; 7.26180; 206
    74, // 7.4; 7.36481; 207
    75, // 7.5; 7.46782; 208
    76, // 7.6; 7.57083; 209
    77, // 7.7; 7.67381; 210
    78, // 7.8; 7.77682; 211
    79, // 7.9; 7.87982; 212
    80, // 8.0; 8.00002; 213
    80, // 8.0; 8.00002; 214
    81, // 8.1; 8.08584; 215
    82, // 8.2; 8.18885; 216
    83, // 8.3; 8.29186; 217
    84, // 8.4; 8.39484; 218
    85, // 8.5; 8.49785; 219
    86, // 8.6; 8.60086; 220
    87, // 8.7; 8.70386; 221
    88, // 8.8; 8.80687; 222
    89, // 8.9; 8.90988; 223
    90, // 9.0; 9.00000; 224
    90, // 9.0; 9.00000; 225
    91, // 9.1; 9.11587; 226
    92, // 9.2; 9.21888; 227
    93, // 9.3; 9.32189; 228
    94, // 9.4; 9.42490; 229
    95, // 9.5; 9.52791; 230
    96, // 9.6; 9.63091; 231
    97, // 9.7; 9.73390; 232
    98, // 9.8; 9.83690; 233
    99, // 9.9; 9.93991; 234
    100, // 10.0; 10.00001; 235
    100, // 10.0; 10.00001; 236
    101, // 10.1; 10.14593; 237
    102, // 10.2; 10.24894; 238
    104, // 10.4; 10.35192; 239
    105, // 10.5; 10.45493; 240
    106, // 10.6; 10.55794; 241
    107, // 10.7; 10.66094; 242
    108, // 10.8; 10.76395; 243
    109, // 10.9; 10.86696; 244
    110, // 11.0; 11.00002; 245
    111, // 11.1; 11.07295; 246
    112, // 11.2; 11.17596; 247
    113, // 11.3; 11.27897; 248
    114, // 11.4; 11.38198; 249
    115, // 11.5; 11.48498; 250
    116, // 11.6; 11.58799; 251
    117, // 11.7; 11.69098; 252
    118, // 11.8; 11.79398; 253
    119, // 11.9; 11.89699; 254
    120  // 12.0; 12.00000; 255
];
