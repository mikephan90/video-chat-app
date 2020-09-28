// connect to root path
const socket = io('/');
// render our own video on screen
const videoGrid = document.getElementById('video-grid');
// create custom peer. undefined is server random generated
const myPeer = new Peer(undefined, {
	host: '/',
	port: '3001',
});

const myVideo = document.createElement('video');
myVideo.muted = true;

const peers = {};

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		addVideoStream(myVideo, stream);
        
		myPeer.on('call', (call) => {
            console.log(stream)
			call.answer(stream);
			const video = document.createElement('video');
			call.on('stream', (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});

		// allow ourselves to be connected to other users
		socket.on('user-connected', (userId) => {
			console.log('User connected: ' + userId);
			connectToNewUser(userId, stream); // send video stream to user
		});
	});

socket.on('user-disconnected', (userId) => {
	if (peers[userId]) peers[userId].close();
});

// connect to peer server and get back ID. this will run, pass id of user
myPeer.on('open', (id) => {
	socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
	// call user with id, send them our video and audio stream
	const call = myPeer.call(userId, stream);
	const video = document.createElement('video');
	// when they call user, send them video stream. they will send it back
	// this will take their stream back and add to list of videos
	call.on('stream', (userVideoStream) => {
		console.log(userVideoStream);
		addVideoStream(video, userVideoStream);
	});
	call.on('close', () => {
		video.remove();
	});
	peers[userId] = call;
}


// allows to play steam, add event to loaded then play
function addVideoStream(video, stream) {
    video.srcObject = stream;
	video.addEventListener('loadedmetadata', () => {
		video.play();
    });
    videoGrid.append(video);
}
