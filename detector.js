
// // Creates a client
// const video = new Video.VideoIntelligenceServiceClient();

// async function detectFacesGCS() {
//   const request = {
//     inputUri: gcsUri,
//     features: ['FACE_DETECTION'],
//     videoContext: {
//       faceDetectionConfig: {
//         // Must set includeBoundingBoxes to true to get facial attributes.
//         includeBoundingBoxes: true,
//         includeAttributes: true,
//       },
//     },
//   };
//   // Detects faces in a video
//   // We get the first result because we only process 1 video
//   const [operation] = await video.annotateVideo(request);
//   const results = await operation.promise();
//   console.log('Waiting for operation to complete...');

//   // Gets annotations for video
//   const faceAnnotations =
//     results[0].annotationResults[0].faceDetectionAnnotations;

//   for (const {tracks} of faceAnnotations) {
//     console.log('Face detected:');

//     for (const {segment, timestampedObjects} of tracks) {
//       if (segment.startTimeOffset.seconds === undefined) {
//         segment.startTimeOffset.seconds = 0;
//       }
//       if (segment.startTimeOffset.nanos === undefined) {
//         segment.startTimeOffset.nanos = 0;
//       }
//       if (segment.endTimeOffset.seconds === undefined) {
//         segment.endTimeOffset.seconds = 0;
//       }
//       if (segment.endTimeOffset.nanos === undefined) {
//         segment.endTimeOffset.nanos = 0;
//       }
//       console.log(
//         `\tStart: ${segment.startTimeOffset.seconds}.` +
//           `${(segment.startTimeOffset.nanos / 1e6).toFixed(0)}s`
//       );
//       console.log(
//         `\tEnd: ${segment.endTimeOffset.seconds}.` +
//           `${(segment.endTimeOffset.nanos / 1e6).toFixed(0)}s`
//       );

//       // Each segment includes timestamped objects that
//       // include characteristics of the face detected.
//       const [firstTimestapedObject] = timestampedObjects;

//       for (const {name} of firstTimestapedObject.attributes) {
//         // Attributes include 'glasses', 'headwear', 'smiling'.
//         console.log(`\tAttribute: ${name}; `);
//       }
//     }
//   }
// }

// detectFacesGCS();