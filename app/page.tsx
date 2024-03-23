"use client"

import { Songs } from "@/constants/Song";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import React, { useRef, useState } from "react";
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { Button, Checkbox, Col, Row, Select, Typography } from "antd";
import { Units } from "@/constants/Unit";
const { Title } = Typography;
const tags = [
  {label: "텐쇼인 에이치", value: 22},
  {label: "히비키 와타루", value: 27},
  {label: "히메미야 토리", value: 6},
  {label: "후시미 유즈루", value: 19},
  {label: "히다카 호쿠토", value: 12},
  {label: "아케호시 스바루", value: 11},
  {label: "유우키 마코토", value: 13},
  {label: "이사라 마오", value: 18},
  {label: "모리사와 치아키", value: 25},
  {label: "신카이 카나타", value: 28},
  {label: "나구모 테토라", value: 1},
  {label: "타카미네 미도리", value: 5},
  {label: "센고쿠 시노부", value: 7},
  {label: "아마기 히이로", value: 67},
  {label: "시라토리 아이라", value: 68},
  {label: "아야세 마요이", value: 69},
  {label: "카제하야 타츠미", value: 70},
  {label: "란 나기사", value: 50},
  {label: "토모에 히요리", value: 41},
  {label: "사에구사 이바라", value: 51},
  {label: "사자나미 쥰", value: 42},
  {label: "이츠키 슈", value: 35},
  {label: "카게히라 미카", value: 34},
  {label: "아오이 히나타", value: 4},
  {label: "아오이 유우타", value: 8},
  {label: "아마기 린네", value: 71},
  {label: "HiMERU", value: 72},
  {label: "오우카와 코하쿠", value: 73},
  {label: "시이나 니키", value: 74},
  {label: "사쿠마 레이", value: 29},
  {label: "하카제 카오루", value: 23},
  {label: "오오가미 코가", value: 16},
  {label: "오토가리 아도니스", value: 15},
  {label: "니토 나즈나", value: 3},
  {label: "텐마 미츠루", value: 30},
  {label: "마시로 토모야", value: 9},
  {label: "시노 하지메", value: 2},
  {label: "하스미 케이토", value: 21},
  {label: "키류 쿠로", value: 26},
  {label: "칸자키 소마", value: 14},
  {label: "스오우 츠카사", value: 10},
  {label: "츠키나가 레오", value: 33},
  {label: "세나 이즈미", value: 24},
  {label: "사쿠마 리츠", value: 17},
  {label: "나루카미 아라시", value: 20},
  {label: "사카사키 나츠메", value: 38},
  {label: "아오바 츠무기", value: 39},
  {label: "하루카와 소라", value: 37},
  {label: "미케지마 마다라", value: 40},
  {label: "사가미 진", value: 31},
  {label: "쿠누기 아키오미", value: 31},
];

const Home = () => {
  const [song, setSong] = useState(17);
  const [selected, setSelected] = useState<number[]>([]);
  const [chordEquals, setChordEquals] = useState(true);
  const [chord, setChord] = useState<number[]>([]);
  const [unit, setUnit] = useState(2);
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg())
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const messageRef = useRef<HTMLParagraphElement | null>(null)

  const load = async () => {
    setIsLoading(true)
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    const ffmpeg = ffmpegRef.current
    ffmpeg.on('log', ({ message }) => {
      if (messageRef.current) messageRef.current.innerHTML += "<br/>" + message;
    })
    // toBlobURL is used to bypass CORS issue, urls with the same
    // domain can be used directly.
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
    })
    await transcode();
    setLoaded(true)
    setIsLoading(false)
  }
  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;

    if (song == 87) {
      await ffmpeg.writeFile(`background.wav`, await fetchFile(`https://kr.object.iwinv.kr/soratools/songs/singer_separation_${song}/background${unit}.wav`));  
    } else {
      await ffmpeg.writeFile(`background.wav`, await fetchFile(`https://kr.object.iwinv.kr/soratools/songs/singer_separation_${song}/background.wav`));  
    }

    for (const character of selected) {
      console.log(selected)
      await ffmpeg.writeFile(`m${character}.wav`, await fetchFile(`https://kr.object.iwinv.kr/soratools/songs/singer_separation_${song}/m${character}.wav`));

    }

    for (const character of (chordEquals ? selected : chord)) {
      await ffmpeg.writeFile(`${character}.wav`, await fetchFile(`https://kr.object.iwinv.kr/soratools/songs/singer_separation_${song}/${character}.wav`));

    }

    const arr = ['-i', 'background.wav'].concat(selected.map((value) => ['-i', `m${value}.wav`]).flat().concat((chordEquals ? selected : chord).map((value) => ['-i', `${value}.wav`]).flat()))

    await ffmpeg.exec(arr.concat(['-filter_complex', `amix=inputs=${arr.length / 2}:duration=longest`, 'output.mp3']));
    const data = (await ffmpeg.readFile('output.mp3')) as any
    if (videoRef.current) {
      videoRef.current.src = URL.createObjectURL(new Blob([data.buffer], { type: 'audio/mp3' }))
      videoRef.current.title = `${Songs.find((s) => s.value === song)!.label} (${selected.map((value) => tags.find((character) => character.value === value)?.label).join(', ')})`
    }
  }

  return ( 
  <main>
    <Row justify={"center"} className="my-8">
      <Col span={12} >
        <Title level={4}>노래 선택</Title>
        <Select
          style={{width: "100%"}}
          placeholder="Please select"
          defaultValue={song}
          onChange={(value) => setSong(value)}
          options={Songs}
          filterOption={(input, option) => ((option?.label ?? '') as string).includes(input)}
        />
      </Col>
    </Row>
    <Row justify={"center"} className="my-8">
      <Col span={12} >
        <Title level={4}>메인 멤버 선택</Title>
        <Select
          style={{width: "100%"}}
          mode="multiple"
          placeholder="Please select"
          defaultValue={selected}
          onChange={(value) => setSelected(value)}
          value={selected}
          options={tags}
          filterOption={(input, option) => ((option?.label ?? '') as string).includes(input)}
        />
        </Col>
    </Row>
    <Row justify={"center"} className="my-8">
      <Col span={12} >
        <Row gutter={16} align={"middle"}>
          <Col>
            <Title level={4}>화음 멤버 선택</Title>
          </Col>
          
          <Col>
            <Checkbox checked={chordEquals} onChange={(e) => setChordEquals(e.target.checked)}>메인 멤버와 동일</Checkbox>
          </Col>
        </Row>
        <Select
          style={{width: "100%"}}
          disabled={chordEquals || selected.length == 0}
          mode="multiple"
          placeholder="Please select"
          defaultValue={chordEquals ? selected : chord}
          onChange={(value) => setChord(value)}
          value={chordEquals ? selected : chord}
          options={tags}
          filterOption={(input, option) => ((option?.label ?? '') as string).includes(input)}
        />
      </Col>
    </Row>
    { song === 87 &&
      <Row justify={"center"} className="my-8">
        <Col span={12} >
          <Title level={4}>배경음 유닛 선택 (FUSIONIC STARS!! 전용)</Title>
          <Select
            style={{width: "100%"}}
            placeholder="Please select"
            defaultValue={unit}
            onChange={(value) => setUnit(value)}
            value={unit}
            options={Units}
            filterOption={(input, option) => ((option?.label ?? '') as string).includes(input)}
          />
          </Col>
      </Row>
    }
    <Row justify={"center"} className="my-8">
      <Col span={12}>
        <Button block onClick={load} loading={isLoading}>만들기</Button>
      </Col>
    </Row>
    <Row justify={"center"} className="my-8">
      <Col span={12} >
         <audio ref={videoRef} controls></audio>
        <div className="h-40 overflow-scroll" ref={messageRef}></div>
      </Col>
    </Row>
  </main>
  );
};

export default Home;