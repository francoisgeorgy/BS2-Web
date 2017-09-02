C="sendmidi dev \"Bass Station II\""
P=0.3


function set_record_mode {
    sendmidi dev "Bass Station II" cc 118 7
}

function set_play_mode {
    sendmidi dev "Bass Station II" cc 118 6
}

function play {
    sendmidi dev "Bass Station II" on $1 60
    sleep $P
    sendmidi dev "Bass Station II" off $1 60
}

set_record_mode

play 60
play 62
play 64
play 65
play 67
play 69
play 71
play 72

set_play_mode

echo -n "play?"
read resp

sendmidi dev "Bass Station II" on 60 60

echo -n "stop?"
read resp

sendmidi dev "Bass Station II" off 60 60

