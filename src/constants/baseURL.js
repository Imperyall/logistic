// export default 'http://localhost:8000';
export default process.env.NODE_ENV === 'production' ? window.location.origin : 'https://' + window.location.hostname + ':9000';
// export default window.location.origin;
//export default process.env.NODE_ENV === 'production' ? 'http://nav.kopt.org:8010' : 'http://10.10.77.7:8000';
// export default 'http://10.10.77.7:8000';
// export default 'http://nav.kopt.org:8010';