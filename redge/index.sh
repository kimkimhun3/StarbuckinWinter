#!/bin/bash

# ******* usage disp ***************************************
function usage() {
  echo $1
  cat <<_EOT_
Usage:
  `basename $0` [-r/--prot ARG] [-u/--url ARG] [-v/--video ARG] [-b/--bitrate ARG] [-f/--fps ARG] [-m/--mtu ARG] [-l/--mttl ARG] [-p/--png ARG] Delivery-URL

Description:
  Version:1.00

  Reticle Transcode Start func

Options:
  [-] :indicates that it cannot be omitted
  -r/--prot    Deliver Protocol:[RTP]/RTSP/RTSP_GST
  -u/--url     IPcam URL       :[-] "IPv4:port/identifier"
                                   ex) "admin:123456@192.168.25.101:554/video1"
  -v/--video   Video-Encoder   :[VCU]/SOFT ... VCU=AVC, SOFT=HEVC
  -b/--bitrate Video-bitrate   :[500] ... The range varies depending on the video option.
                  video option=VCU  ... 500 ~ 4000kbps
                  video option=SOFT ...  50 ~ 500kbps
  -f/--fps     Encode-fps      :[input-fps]30/15/10/5/3/2 ... Rounded down to the nearest input-fps.

  -m/--mtu     Video-MTU       :[1400] ... 600 ~ 1400
  -l/--mttl    TTL-Field       :[1] ... Multicast TTL (1 ~ 255)
  -p/--png     png-file        :[-] ... Reticle Pattern png file path
                                   ex) /root/scope_white_black.png
  -h/--hport   HTTP-port       :[8080] ... 1024 ~ 65535

  Delivery-URI                 :[192.168.25.89:5004] ... IPv4:Dst-Port

  --help    Usage-Display      :-

_EOT_
  exit 1
}

# ******* option default set ********************************
video=VCU
bitrate=500
fps=""
mtu=1400
mttl=1
png=""
hport=8080

############ internal shell info set ##########################
CMDNAME=`basename $0`
MYCMD_PATH=`cat /root/.env_file`
LOG_CMD="$MYCMD_PATH/PLOG-out.sh"
RETI_PROCESS="$MYCMD_PATH/RETI-process.sh"
RETI_PROC_NAME="RETI-process.sh"
GST_CMDNAME="gst-launch-1.0 -v uridecodebin name="IPCid1""
RETI_CMDNAME="python3 "$MYCMD_PATH"/dynamic_overlay_scale.py"

RTSP_SRV_CONF_NAME=""$MYCMD_PATH"/MTX/mediamtx.yml"

IPCAM_INFO_FILE="/root/.IPCAM_info_file_1"
RETI_END_FILE="/root/.reti_end_file"

# input arg save
SAVE_INPUT=$@

# ******* option analay ************************************
while getopts r:u:v:b:f:m:l:p:h:-: opt; do
    # OPTARG  [=] parse in  [opt] and [optarg] set
    optarg="$OPTARG"
    if [[ "$opt" = - ]]; then
        opt="-${OPTARG%%=*}"
        optarg="${OPTARG/${OPTARG%%=*}/}"
        optarg="${optarg#=}"
    fi
# ******* option overwite set ******************************

    case "-$opt" in
        -r|--prot)
            prot="$optarg"
            if [ "$prot" != "RTP" ] && [ "$prot" != "RTSP" ]&& [ "$prot" != "RTSP_GST" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> prot option is RTP or RTSP or RTSP_GST"

                exit 1
            fi
            ;;
        -u|--url)
            url="$optarg"
            ;;
        -v|--video)
            video="$optarg"
            if [ "$video" != "VCU" ] && [ "$video" != "SOFT" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> video option is VCU or SOFT"

                exit 1
            fi
            ;;
        -b|--bitrate)
            bitrate="$optarg"
            if [ "$bitrate" = "" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> bitrate option is null"

                exit 1
            fi
            ;;
        -f|--fps)
            fps="$optarg"
            if [ "$fps" = "" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> fps option is null"

                exit 1
            fi
            ;;

        -m|--mtu)
            mtu="$optarg"
            if [ "$mtu" = "" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> mtu option is null"

                exit 1
            fi
            if [ "$mtu" -lt 600 ] || [ "$mtu" -gt 1400 ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> mtu option is illegal"

                exit 1
            fi
            ;;
        -l|--mttl)
            mttl="$optarg"
            if [ "$mttl" = "" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> mttl option is null"

                exit 1
            fi
            if [ "$mttl" -lt 1 ] || [ "$mttl" -gt 255 ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> mttl option is illegal(1 ~ 255)"

                exit 1
            fi
            ;;
        -p|--png)
            png="$optarg"
            ;;
        -h|--hport)
            hport="$optarg"
            if [ "$hport" = "" ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> hport option is null"

                exit 1
            fi
            if [ "$hport" -lt 1024 ] || [ "$hport" -gt 65535 ]; then
                $LOG_CMD "[$CMDNAME][ERROR] <xxx> hport option is illegal"

                exit 1
            fi
            ;;

        --)
            break
            ;;
        --help)
            usage ""
            exit 0
            ;;
        -\?)
            echo "[$CMDNAME][ERROR] <002> Option argument is undefined."

            exit 1
            ;;
        --*)
            echo "[$CMDNAME][ERROR] <003> illegal option -- ${opt##-}."

            exit 1
            ;;
    esac
done
shift $((OPTIND - 1))

# para set
DELIVERY_URL="$1"

if [ "$url" = "" ]; then
    $LOG_CMD "[$CMDNAME][ERROR] <xxx> URL option is null"

    exit 1
fi

if [ "$video" = "SOFT" ]; then
    if [ "$bitrate" -lt 50 ] || [ "$bitrate" -gt 500 ]; then
        $LOG_CMD "[$CMDNAME][ERROR] <xxx> bitrate option is illegal"

        exit 1
    fi
else
    if [ "$bitrate" -lt 500 ] || [ "$bitrate" -gt 4000 ]; then
        $LOG_CMD "[$CMDNAME][ERROR] <xxx> bitrate option is illegal"

        exit 1
    fi
fi

if [ "$fps" != "" ]; then
    if [ "$fps" != 30 ] && [ "$fps" != 15 ] && [ "$fps" != 10 ] && [ "$fps" != 5 ] && [ "$fps" != 3 ] && [ "$fps" != 2 ]; then
        $LOG_CMD "[$CMDNAME][ERROR] <xxx> fps option is illegal"

        exit 1
    fi 
fi

if [ "$png" = "" ]; then
    $LOG_CMD "[$CMDNAME][ERROR] <xxx> png option is null"

    exit 1
fi

# ******* trap function(control-C -> SINGINT+SIGEXIT) ********************************
function trap_sub() {
    touch "$RETI_END_FILE"

    # kill loop
    IFS=',' read -ra KILL_ARR <<< "$KILL_LIST"
    for (( ct = 0; ct < ${#KILL_ARR[@]}; ++ct ))
    do
        while true
        do
            PID=`pgrep -f "${KILL_ARR[ct]}"`
            if [ "$PID" = "" ]; then
                break
            fi
            kill $PID &> /dev/null
            sleep 0.1
        done

        sleep 0.1
    done

    rm -f "$RETI_END_FILE"

    rm -f "$IPCAM_INFO_FILE"

    exit 0
}

############ IP-Cam Informatio analay #########################

echo "[$CMDNAME][INFOM] Start"

# Codec Name mapping
map_video_codec() {
    case "$1" in
        H264) echo "AVC" ;;
        H265) echo "HEVC" ;;
        *) echo "?" ;;
    esac
}

map_audio_codec() {
    case "$1" in
        x-alaw) echo "A-Law" ;;
        x-mulaw) echo "U-Law" ;;
        x-opus) echo "Opus" ;;
        mpeg) echo "AAC" ;;
        *) echo "?" ;;
    esac
}

############ IP-Cam Informatio get start #########################

# Background RUN check
PID=`pgrep -f "$GST_CMDNAME"`
if [ "$PID" != "" ]; then
    $LOG_CMD "[$CMDNAME][ERROR] <xxx> IP-cam Information Get Processing is in progress and cannot be executed"

    exit 1
fi

$LOG_CMD "[$CMDNAME][INFOM] Start-> $SAVE_INPUT"

if [ "$prot" = "RTSP" ]; then
    RTSP_SRV_PROCESS=""$MYCMD_PATH"/MTX/mediamtx"
    RTSP_SRV_PROC_NAME="mediamtx"
else
    RTSP_SRV_PROCESS="$MYCMD_PATH/rtsp-server-app.out"
    RTSP_SRV_PROC_NAME="rtsp-server-app.out"
fi

KILL_LIST=""$GST_CMDNAME","$RETI_PROC_NAME","$RETI_CMDNAME","$RTSP_SRV_PROC_NAME""


# ******* trap function set *********************************
# default Command setting
trap 'trap_sub' EXIT

# Background RUN
gst-launch-1.0 -v uridecodebin name="IPCid1" uri=rtsp://"$url" ! fakesink &> "$IPCAM_INFO_FILE" &
sleep 1

############ IP-Cam Informatio analay #########################
while true
do
    if [ -s "$IPCAM_INFO_FILE" ]; then
        sleep 0.1

        line_count=$(wc -l < "$IPCAM_INFO_FILE" | awk '{print $1}')
        if [ $line_count -lt 6 ]; then
            continue
        fi

        # Unauthorized check
        grep -q "Could not open resource" "$IPCAM_INFO_FILE"
        if [ $? -eq 0 ]; then
            $LOG_CMD "[$CMDNAME][ERROR] <xxx> IP Camera Connection Error"
            exit 1
        fi

        # Unauthorized check
        grep -q "Unauthorized" "$IPCAM_INFO_FILE"
        if [ $? -eq 0 ]; then
            $LOG_CMD "[$CMDNAME][ERROR] <xxx> IP Camera Authentication Error"
            exit 1
        fi

        TO_flag=0
        grep -q "GstRtpSession:rtpsession.: stats = application/x-rtp-session-stats" "$IPCAM_INFO_FILE"
        if [ $? -ne 0 ]; then
            # file size check
            file_size=$(stat -c%s "$IPCAM_INFO_FILE")
            if [ "$file_size" -le 100000 ]; then
                continue
            else
                TO_flag=1
            fi
        fi

        while true
        do
            PID=`pgrep -f "$GST_CMDNAME"`
            if [ "$PID" = "" ]; then
                break
            fi

            kill $PID &> /dev/null
            sleep 0.1
        done

        if [ "$TO_flag" = 1 ]; then
            $LOG_CMD "[$CMDNAME][ERROR] <xxx> IP Camera Information Analysis Timeout"
            exit 1
        fi

        INPUT_FILE="$IPCAM_INFO_FILE"

        # 初期状態
        video_codec="--"
        width="--"
        height="--"
        vfps="--"
        audio_codec="--"

        # --- Video Codec get ---
        video_line=$(grep 'media=(string)video' "$INPUT_FILE" | head -n1)
        if [[ "$video_line" =~ encoding-name=\(string\)([A-Za-z0-9\-]+) ]]; then
            raw_vcodec="${BASH_REMATCH[1]}"
            video_codec=$(map_video_codec "$raw_vcodec")
        fi

        # --- Video Resolution and fps get ---
        caps_line=$(grep 'video/x-' "$INPUT_FILE" | grep 'width=' | grep 'height=' | grep 'framerate=' | head -n1)

        if [[ "$caps_line" =~ width=\(int\)([0-9]+) ]]; then
            width="${BASH_REMATCH[1]}"
        fi

        if [[ "$caps_line" =~ height=\(int\)([0-9]+) ]]; then
            height="${BASH_REMATCH[1]}"
        fi

        if [[ "$caps_line" =~ framerate=\(fraction\)([0-9]+)/([0-9]+) ]]; then
            num="${BASH_REMATCH[1]}"
            den="${BASH_REMATCH[2]}"
            if [[ "$den" -ne 0 && "$num" -ne 0 ]]; then
                vfps=$((num / den))
            fi
        fi

        # --- Audio Codec get ---
        audio_line=$(grep 'GstPad:sink: caps = audio/' "$INPUT_FILE" | head -n1)
        if [[ "$audio_line" =~ audio/([A-Za-z0-9\-]+) ]]; then
            raw_acodec="${BASH_REMATCH[1]}"
            audio_codec=$(map_audio_codec "$raw_acodec")
        fi
        
        break
    else
        sleep 0.1
    fi
done

############ IP-Cam transcode & Reticle superimposition #########################

# Video-Resolution check
if [ "$width" -gt 1920 ] || [ "$height" -gt 1080 ]; then
    $LOG_CMD "[$CMDNAME][ERROR] <xxx> IP Camera video-resolutin over (below 1920x1080)"
    exit 1
fi

# RTSP client pipe set
PIP_RTSP="rtspsrc location=rtsp://"$url" protocols=udp latency=100"

# Video Decoder pipe set
if [ "$video_codec" = "HEVC" ]; then
    PIP_DECODE="rtph265depay ! h265parse ! v4l2h265dec"
else
    PIP_DECODE="rtph264depay ! h264parse ! v4l2h264dec"
fi

# Video Rate pipe set
if [ "$video" = "VCU" ]; then
    if [ "$vfps" -gt 30 ]; then
        IN_FPS=30
    else
        IN_FPS="$vfps"
    fi
else
    if [ "$vfps" -gt 10 ]; then
        IN_FPS=10
    else
        IN_FPS="$vfps"
    fi
fi

if [ "$fps"  = "" ]; then
    fps="$IN_FPS"
fi
if [ "$fps" -gt "$IN_FPS"  ]; then
    fps=$IN_FPS
fi

PIP_VRATE="videorate drop-only=true max-rate=$IN_FPS ! video/x-raw,framerate=$IN_FPS/1"

PIP_VCONVERT1="imxvideoconvert_g2d ! queue ! mix.sink_0"

PIP_CONPOSIT="imxcompositor_g2d name=mix back-enable=false sink_0::xpos=0 sink_0::ypos=0 sink_0::alpha=1.0 sink_1::xpos=$((("$width" - "$height") / 2)) sink_1::ypos=0 sink_1::alpha=1.0"

PIP_VCONVERT2="imxvideoconvert_g2d ! videorate drop-only=true max-rate="$fps" ! video/x-raw,width="$width",height="$height",framerate="$fps"/1"
#PIP_VCONVERT2="imxvideoconvert_g2d ! videorate drop-only=true max-rate="$fps" ! video/x-raw,width="$width",height="$height", framerate=$(("$fps" * 1000))/1001"

# Reticle png-file crop pipe set
PIP_PNG="filesrc location=$png ! pngdec ! imagefreeze ! videoconvert ! videocrop name=crop left=0 right=0 top=0 bottom=0 ! videoscale ! capsfilter name=ocaps caps=video/x-raw,format=RGBA,width="$height",height="$height" ! queue ! mix.sink_1"

# Encoder pipe set
if [ "$video" = "VCU" ]; then
    # Hard encoder

    if [ "$prot" = "RTSP" ]; then
        PIP_AVCENC="v4l2h264enc qos=false extra-controls=\\\"encode,frame_level_rate_control_enable=1,h264_mb_level_rate_control=1,repeat_sequence_header=1,video_gop_size=$((fps * 1)),video_bitrate=$((bitrate * 900)),video_bitrate_mode=1\\\""

        PIP_RTP="h264parse config-interval=1 ! video/x-h264,stream-format=byte-stream,alignment=au"

        PIP_DELIV="rtspclientsink location=rtsp://127.0.0.1:554/stream protocols=udp latency=0"
    elif [ "$prot" = "RTSP_GST" ]; then
        PIP_AVCENC="v4l2h264enc qos=false extra-controls=\\\"encode,frame_level_rate_control_enable=1,h264_mb_level_rate_control=1,repeat_sequence_header=1,video_gop_size=$((fps * 1)),video_bitrate=$((bitrate * 900)),video_bitrate_mode=1\\\""

        PIP_RTP="h264parse config-interval=1 ! rtph264pay pt=96 config-interval=1 mtu=$mtu"

        PIP_DELIV="multiudpsink clients=127.0.0.1:5002 auto-multicast=false buffer-size=8388608 max-lateness=-1 sync=true async=false"
    else
        PIP_AVCENC="v4l2h264enc qos=false extra-controls=\\\"encode, slice_partitioning_method=1,number_of_mbs_in_a_slice=40,frame_level_rate_control_enable=1,h264_mb_level_rate_control=1,repeat_sequence_header=1,video_gop_size=$((fps * 1)),video_bitrate=$((bitrate * 900)),video_bitrate_mode=1\\\""

        PIP_RTP="h264parse config-interval=1 ! rtph264pay pt=96 config-interval=1 mtu=$mtu"

        PIP_DELIV="queue ! multiudpsink clients="$DELIVERY_URL" auto-multicast=false ttl-mc="$mttl" buffer-size=8388608 max-lateness=-1 sync=true async=false"
    fi

    PIP_CMD=""$PIP_RTSP" ! "$PIP_DECODE" ! "$PIP_VRATE" ! "$PIP_VCONVERT1" "$PIP_CONPOSIT" ! "$PIP_VCONVERT2" ! "$PIP_AVCENC" ! "$PIP_RTP" ! "$PIP_DELIV" "$PIP_PNG""
    PYTHON_CMD=""$RETI_CMDNAME" --http-port "$hport" --pipeline \""$PIP_CMD"\" &> /dev/null &"
else
    if [ "$prot" = "RTSP" ]; then
        SLICE=0
        PIP_DELIV="-f rtsp rtsp://127.0.0.1:554/stream"
    elif [ "$prot" = "RTSP_GST" ]; then
        SLICE=0
        PIP_DELIV="rtp://127.0.0.1:5002?pkt_size="$mtu"\&buffer_size=8388608"
    else
        SLICE=0
        PIP_DELIV="rtp://"$DELIVERY_URL"?pkt_size="$mtu"\&ttl="$mttl"\&buffer_size=8388608"
    fi

    # ffmpeg encoder
    PIP_JPGENC="jpegenc quality=85 idct-method=ifast ! fdsink fd=1"
    PIP_HEVCENC="ffmpeg -flags low_delay -analyzeduration 0 -probesize 32 -f mjpeg -framerate "$fps" -i - -an -c:v libx265 -preset ultrafast -tune zerolatency -pix_fmt yuv420p -r "$fps" -b:v "$bitrate"k"
    PIP_HEVCPARA="-x265-params bframes=0:aq-mode=3:repeat-headers=1:rc-lookahead=0:keyint=$((fps * 2)):intra-refresh="$SLICE":vbv-bufsize=$((bitrate * 120 / 100)):vbv-maxrate=$((bitrate * 80 / 100)):vbv-init=0.5:chromaloc=0 -flush_packets 1"
    PIP_RTP="-f rtp -payload_type 96"

    PIP_CMD=""$PIP_RTSP" ! "$PIP_DECODE" ! "$PIP_VRATE" ! "$PIP_VCONVERT1" "$PIP_CONPOSIT" ! "$PIP_VCONVERT2" ! "$PIP_JPGENC" "$PIP_PNG""
    PYTHON_CMD=""$RETI_CMDNAME"  --http-port "$hport" --pipeline \""$PIP_CMD"\" 2>/dev/null | "$PIP_HEVCENC" "$PIP_HEVCPARA" "$PIP_RTP" "$PIP_DELIV" &> /dev/null &"
fi

# admin:123456@192.168.25.201:554/profile1 -> user:pass get
auth="${url%@*}"

# admin:123456 -> admin get
user="${auth%%:*}"

# admin:123456 -> 123456 get
pass="${auth#*:}"

# admin:123456@192.168.25.201:554/profile1 -> 192.168.25.201:554/profile get
hostpart="${url#*@}"

# 192.168.25.201:554/profile1 -> 192.168.25.201 get
IPcam_ip="${hostpart%%:*}"

# 192.168.25.201:554/profile1 -> 554 get
port_and_path="${hostpart#*:}"
srv_port="${port_and_path%%/*}"

# --- Infomation output ---
$LOG_CMD "[$CMDNAME][INFOM] user: $user, pass: $pass, ip: $IPcam_ip, port: $srv_port"
$LOG_CMD "[$CMDNAME][INFOM] IP-Cam infomation [video: $video_codec,$width,$height,$vfps] [audio: $audio_codec]"
$LOG_CMD "[$CMDNAME][INFOM] CMD: $PYTHON_CMD"

# RTSP server run
if [ "$prot" = "RTSP" ]; then
    "$RTSP_SRV_PROCESS" "$RTSP_SRV_CONF_NAME" &> /dev/null &
else
    if [ "$prot" = "RTSP_GST" ]; then
        if [ "$video" = "SOFT" ]; then
            "$RTSP_SRV_PROCESS" --port="$srv_port" --disable-cert=false --login="$user" --password="$pass" "udpsrc port=5002 caps=\"application/x-rtp,media=(string)video,clock-rate=(int)90000,encoding-name=(string)H265,payload=(int)96\" ! rtph265depay ! h265parse ! rtph265pay name=pay0 pt=96 config-interval=-1" &> /dev/null &
        else
            "$RTSP_SRV_PROCESS" --port="$srv_port" --disable-cert=false --login="$user" --password="$pass" "udpsrc port=5002 caps=\"application/x-rtp,media=(string)video,clock-rate=(int)90000,encoding-name=(string)H264,payload=(int)96\" ! rtph264depay ! h264parse ! rtph264pay name=pay0 pt=96 config-interval=-1" &> /dev/null &
        fi
    fi
fi

# --- Python command Run ---
eval ${PYTHON_CMD}

# Automatic Reticle Pattern Magnification Control Process start
"$RETI_PROCESS" "$auth" "$IPcam_ip" 1 &

$LOG_CMD "[$CMDNAME][OK]"

# Background Python command Run check -> If there is no process, restart
while true
do
    if [ ! -f "$RETI_END_FILE" ]; then
        PID=`pgrep -f "$RETI_CMDNAME"`
        if [ "$PID" = "" ]; then
            # --- Retry Run ---
            $LOG_CMD "[$CMDNAME][INFOM] Reticlecommand retry !!"

            eval ${PYTHON_CMD} 
        fi
    else
        rm -f "$RETI_END_FILE"
        break
    fi

    sleep 1
done

exit 0