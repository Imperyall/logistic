//export default 'http://localhost:3000';
export default process.env.NODE_ENV === 'production' ? 'http://nav.kopt.org:8010' : 'http://10.10.77.7:8000';
//export default 'http://nav.kopt.org:8010';
