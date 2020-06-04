import * as firebase from 'firebase/app';

import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/functions';

const firebaseConfig = {
  apiKey: 'AIzaSyAn3kfsjmhMJ04WA-phAisz6mkzSSYyBzo',
  authDomain: 'wire-place.firebaseapp.com',
  databaseURL: 'https://wire-place.firebaseio.com',
  projectId: 'wire-place',
  storageBucket: 'wire-place.appspot.com',
  messagingSenderId: '572004070967',
  appId: '1:572004070967:web:ea00a8645c29ae7634b1b2',
  measurementId: 'G-6KL5W42R19',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

export default firebase;
