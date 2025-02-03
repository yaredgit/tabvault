// This script helps coordinate the demo recording
const steps = [
  {
    action: 'Open tabs',
    duration: 2000,
    instruction: 'Open GitHub, MDN, and Stack Overflow tabs'
  },
  {
    action: 'Click extension',
    duration: 1000,
    instruction: 'Click the TabVault icon'
  },
  {
    action: 'Save current',
    duration: 1500,
    instruction: 'Click Save Current Tab'
  },
  {
    action: 'Save all',
    duration: 1500,
    instruction: 'Click Save All Tabs'
  },
  {
    action: 'Show saved',
    duration: 2000,
    instruction: 'Show saved tabs list'
  },
  {
    action: 'Restore tab',
    duration: 1500,
    instruction: 'Click Restore on a tab'
  }
];

let currentStep = 0;

function showNextStep() {
  if (currentStep < steps.length) {
    console.log(`Step ${currentStep + 1}: ${steps[currentStep].instruction}`);
    setTimeout(() => {
      currentStep++;
      showNextStep();
    }, steps[currentStep].duration);
  }
}

// Start recording with Chrome's Screen Capture API
async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1280, height: 800 },
      audio: false
    });
    
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tabvault-demo.webm';
      a.click();
    };
    
    recorder.start();
    showNextStep();
    
    // Stop recording after all steps
    setTimeout(() => {
      recorder.stop();
      stream.getTracks().forEach(track => track.stop());
    }, steps.reduce((total, step) => total + step.duration, 0) + 1000);
    
  } catch (err) {
    console.error('Error recording demo:', err);
  }
}

// Add this to your screenshot guide:
document.getElementById('startRecording')?.addEventListener('click', startRecording); 