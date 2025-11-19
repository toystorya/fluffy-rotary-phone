// Three.js minimal prototype: player cube, ground, camera follow, keyboard + touch controls

let scene, camera, renderer;
let player, ground;
let speed = 5;
let gravity = -20;
let jumpSpeed = 7;
let velocityY = 0;
let keys = {}; // track pressed keys

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x88ccee);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 5, 10);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // light
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.0);
  scene.add(hemi);

  // ground
  const gmat = new THREE.MeshStandardMaterial({ color: 0x228833 });
  ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), gmat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  scene.add(ground);

  // player cube
  const pmat = new THREE.MeshStandardMaterial({ color: 0xffaa33 });
  player = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), pmat);
  player.position.set(0, 0.5, 0);
  scene.add(player);

  // window resize
  window.addEventListener('resize', onWindowResize);

  // keyboard events
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // simple touch: left half = left, right half = right, top half = jump
  const canvas = renderer.domElement;
  canvas.addEventListener('touchstart', (ev) => {
    ev.preventDefault();
    const x = ev.touches[0].clientX;
    const y = ev.touches[0].clientY;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (y < h / 3) { // top third -> jump
      if (isGrounded()) {
        velocityY = jumpSpeed;
      }
    } else {
      if (x < w / 2) {
        keys['TouchLeft'] = true;
      } else {
        keys['TouchRight'] = true;
      }
    }
  }, { passive: false });
  canvas.addEventListener('touchend', (ev) => {
    ev.preventDefault();
    keys['TouchLeft'] = false;
    keys['TouchRight'] = false;
  }, { passive: false });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function isGrounded() {
  return player.position.y <= 0.501;
}

let lastTime = performance.now();
function animate(now) {
  requestAnimationFrame(animate);
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;

  // horizontal input
  let moveX = 0;
  if (keys['KeyA'] || keys['ArrowLeft'] || keys['TouchLeft']) moveX -= 1;
  if (keys['KeyD'] || keys['ArrowRight'] || keys['TouchRight']) moveX += 1;

  player.position.x += moveX * speed * dt;

  // simple jump on Space
  if ((keys['Space'] || keys['KeyW'] || keys['ArrowUp']) && isGrounded()) {
    velocityY = jumpSpeed;
  }

  // apply gravity
  velocityY += gravity * dt;
  player.position.y += velocityY * dt;

  // ground collision
  if (player.position.y <= 0.5) {
    player.position.y = 0.5;
    velocityY = 0;
  }

  // camera follow (smooth)
  const desiredCamPos = new THREE.Vector3(player.position.x, player.position.y + 4, player.position.z + 8);
  camera.position.lerp(desiredCamPos, 0.1);
  camera.lookAt(player.position);

  renderer.render(scene, camera);
}
