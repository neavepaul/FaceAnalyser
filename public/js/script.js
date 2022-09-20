var faceMatcher
const url = '../faceData.json'

const video = document.getElementById('videoInput')

Promise.all([
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models') //heavier/accurate version of tiny face detector
]).then(start)

function start() {
    document.body.append('Models Loaded')

    video.src = './videos/speech.mp4'

    // navigator.getUserMedia(
    //     {video:{}},
    //     stream => video.srcObject = stream,
    //     err => console.error(err))
    recognizeFaces()
}

async function recognizeFaces() {
    var labeledDescriptors;

    console.log('GOING TO LOAD');


    await fetch(url)
    .then(res => res.json())
    .then(data => {
        // console.log(data);
        labeledDescriptors = data.map( x=>faceapi.LabeledFaceDescriptors.fromJSON(x) );
        console.log('start');
        // console.log(JSON.stringify(labeledFaceDescriptors))
        console.log('finish');

    })
    .catch((error) => {
        console.error(error);
    })
    document.body.append(' Faces Loaded | ')


    console.log('LOADED');
    

    console.log('LABELED DESCRIPTORS')
    console.log(JSON.stringify(labeledDescriptors))
    const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.6)
    document.body.append(' FaceMatcher Created')

    video.addEventListener('play', () => {
        console.log('video played')

        const canvas = faceapi.createCanvasFromMedia(video)
        document.body.append(canvas)

        const displaySize = {width: video.width, height: video.height}
        faceapi.matchDimensions(canvas, displaySize)

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors().withFaceExpressions()

            const resizedDetections = faceapi.resizeResults(detections, displaySize)

            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

            const results = resizedDetections.map((d) => {
                return faceMatcher.findBestMatch(d.descriptor)
            })
            results.forEach( (result, i) => {
                const box = resizedDetections[i].detection.box
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
                drawBox.draw(canvas)
            })
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        }, 100)
    })

}

