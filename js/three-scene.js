/**
 * 3D Campus World Scene using Three.js
 * Renders the IIIT Kalyani Entrance Gate, Campus Road, Architectural Blocks, Trees & Atmosphere
 * Driven by scroll progress and mouse parallax.
 */

class Campus3DScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.objects = {};
    this.particles = null;
    this.scrollProgress = 0;
    this.targetScroll = 0;
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    if (!window.THREE) {
      console.warn('Three.js not loaded yet');
      return;
    }

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a1612); // Deep forest dusk
    this.scene.fog = new THREE.FogExp2(0x0a1612, 0.018);

    // 2. Camera setup
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 150);
    this.camera.position.set(0, 3.2, 14);

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Build 3D World Geometry
    this.buildGroundAndRoad();
    this.buildCampusGate();
    this.buildCampusBuildings();
    this.buildFoliage();
    this.buildCharacters();
    this.buildAtmosphere();

    // 6. Event listeners
    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

    // 7. Initial render loop
    this.animate();
  }

  setupLighting() {
    const ambient = new THREE.AmbientLight(0xdbe6df, 0.85);
    this.scene.add(ambient);

    // Main golden sun / dusk light
    const sunLight = new THREE.DirectionalLight(0xfef3c7, 1.4);
    sunLight.position.set(12, 20, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -15;
    sunLight.shadow.camera.right = 15;
    sunLight.shadow.camera.top = 15;
    sunLight.shadow.camera.bottom = -15;
    this.scene.add(sunLight);
    this.objects.sunLight = sunLight;

    // Gate decorative accent light (teal glow)
    const gatePointLight = new THREE.PointLight(0x06b6d4, 1.5, 12);
    gatePointLight.position.set(0, 4.5, 4.5);
    this.scene.add(gatePointLight);

    // Campus quad warmth
    const quadLight = new THREE.PointLight(0xf59e0b, 1.8, 25);
    quadLight.position.set(0, 5, -15);
    this.scene.add(quadLight);
  }

  buildGroundAndRoad() {
    // Lawn ground
    const groundGeo = new THREE.PlaneGeometry(120, 120);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x122c22, // Rich dark forest turf
      roughness: 0.9,
      metalness: 0.1
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Paved entrance road
    const roadGeo = new THREE.PlaneGeometry(5.5, 80);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x22362f,
      roughness: 0.7,
      metalness: 0.1
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.position.set(0, 0.02, -10);
    road.receiveShadow = true;
    this.scene.add(road);

    // Road dashed dividing line
    const dashGroup = new THREE.Group();
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xe2987f });
    for (let z = 15; z > -45; z -= 3.5) {
      const dashGeo = new THREE.PlaneGeometry(0.2, 1.8);
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.03, z);
      dashGroup.add(dash);
    }
    this.scene.add(dashGroup);
  }

  buildCampusGate() {
    const gateGroup = new THREE.Group();
    gateGroup.position.set(0, 0, 4.5);

    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xd9c29b, roughness: 0.6 }); // Terracotta stone
    const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x1e362d, roughness: 0.8 });
    const metallicMat = new THREE.MeshStandardMaterial({ color: 0x082a22, roughness: 0.3, metalness: 0.7 });

    // Left Pillar
    const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.2, 1.2), pillarMat);
    leftPillar.position.set(-3.5, 2.6, 0);
    leftPillar.castShadow = true;
    leftPillar.receiveShadow = true;
    gateGroup.add(leftPillar);

    const leftBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.5), darkStoneMat);
    leftBase.position.set(-3.5, 0.3, 0);
    gateGroup.add(leftBase);

    // Right Pillar
    const rightPillar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 5.2, 1.2), pillarMat);
    rightPillar.position.set(3.5, 2.6, 0);
    rightPillar.castShadow = true;
    rightPillar.receiveShadow = true;
    gateGroup.add(rightPillar);

    const rightBase = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.6, 1.5), darkStoneMat);
    rightBase.position.set(3.5, 0.3, 0);
    gateGroup.add(rightBase);

    // Top Beam Archway
    const topArch = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.8, 1.4), darkStoneMat);
    topArch.position.set(0, 5.2, 0);
    topArch.castShadow = true;
    gateGroup.add(topArch);

    // Signboard "IIIT KALYANI"
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(6.4, 0.7, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x061d18, roughness: 0.3, metalness: 0.5 })
    );
    signBoard.position.set(0, 5.2, 0.75);
    gateGroup.add(signBoard);

    // Signboard emblem glowing strip
    const emblemStrip = new THREE.Mesh(
      new THREE.BoxGeometry(5.8, 0.1, 0.05),
      new THREE.MeshBasicMaterial({ color: 0xd79a22 }) // Mustard gold accent
    );
    emblemStrip.position.set(0, 5.4, 0.91);
    gateGroup.add(emblemStrip);

    // Wrought-iron gate doors (half open to invite junior inside!)
    const leftGate = this.createGateDoor(2.6, 3.8, true);
    leftGate.position.set(-3, 1.9, 0);
    leftGate.rotation.y = Math.PI / 4; // opened inwards
    gateGroup.add(leftGate);

    const rightGate = this.createGateDoor(2.6, 3.8, false);
    rightGate.position.set(3, 1.9, 0);
    rightGate.rotation.y = -Math.PI / 4; // opened inwards
    gateGroup.add(rightGate);

    // Glowing gate pillar lights
    const lanternGeo = new THREE.BoxGeometry(0.4, 0.5, 0.4);
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.8
    });
    const leftLantern = new THREE.Mesh(lanternGeo, lanternMat);
    leftLantern.position.set(-3.5, 5.5, 0);
    gateGroup.add(leftLantern);

    const rightLantern = new THREE.Mesh(lanternGeo, lanternMat);
    rightLantern.position.set(3.5, 5.5, 0);
    gateGroup.add(rightLantern);

    this.scene.add(gateGroup);
    this.objects.gateGroup = gateGroup;
  }

  createGateDoor(width, height, isLeft) {
    const door = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1e2925, metalness: 0.8, roughness: 0.4 });
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, height);

    // Vertical bars
    const count = 7;
    for (let i = 0; i < count; i++) {
      const bar = new THREE.Mesh(barGeo, frameMat);
      bar.position.set((isLeft ? 1 : -1) * (i * (width / count)), 0, 0);
      door.add(bar);
    }

    // Horizontal rails
    const railGeo = new THREE.BoxGeometry(width, 0.08, 0.08);
    const railTop = new THREE.Mesh(railGeo, frameMat);
    railTop.position.set((isLeft ? 1 : -1) * (width / 2), height / 2 - 0.2, 0);
    door.add(railTop);

    const railBottom = new THREE.Mesh(railGeo, frameMat);
    railBottom.position.set((isLeft ? 1 : -1) * (width / 2), -height / 2 + 0.2, 0);
    door.add(railBottom);

    return door;
  }

  buildCampusBuildings() {
    const campus = new THREE.Group();
    const blockMat1 = new THREE.MeshStandardMaterial({ color: 0x13382c, roughness: 0.7 });
    const blockMat2 = new THREE.MeshStandardMaterial({ color: 0xeadab8, roughness: 0.8 }); // Warm cream
    const windowMatLit = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      emissive: 0xfacc15,
      emissiveIntensity: 0.6
    });

    // Central Academic Block (in distance)
    const centralBlock = new THREE.Group();
    centralBlock.position.set(0, 0, -28);

    const mainBuilding = new THREE.Mesh(new THREE.BoxGeometry(16, 9, 8), blockMat1);
    mainBuilding.position.y = 4.5;
    mainBuilding.castShadow = true;
    mainBuilding.receiveShadow = true;
    centralBlock.add(mainBuilding);

    // Windows grid on central building
    for (let r = 0; r < 3; r++) {
      for (let c = -6; c <= 6; c += 2) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.2, 0.1), windowMatLit);
        win.position.set(c, 2.5 + r * 2.2, 4.05);
        centralBlock.add(win);
      }
    }
    campus.add(centralBlock);

    // Left Department Wing (ECE & Hardware Labs)
    const leftWing = new THREE.Group();
    leftWing.position.set(-16, 0, -18);
    leftWing.rotation.y = Math.PI / 6;

    const leftBldg = new THREE.Mesh(new THREE.BoxGeometry(10, 7, 6), blockMat2);
    leftBldg.position.y = 3.5;
    leftBldg.castShadow = true;
    leftBldg.receiveShadow = true;
    leftWing.add(leftBldg);

    // Windows
    for (let r = 0; r < 2; r++) {
      for (let c = -3.5; c <= 3.5; c += 2) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.1, 0.1), windowMatLit);
        win.position.set(c, 2.2 + r * 2.2, 3.05);
        leftWing.add(win);
      }
    }
    campus.add(leftWing);

    // Right Wing (Auditorium & Computing Center)
    const rightWing = new THREE.Group();
    rightWing.position.set(16, 0, -18);
    rightWing.rotation.y = -Math.PI / 6;

    const rightBldg = new THREE.Mesh(new THREE.BoxGeometry(10, 7.5, 6), blockMat2);
    rightBldg.position.y = 3.75;
    rightBldg.castShadow = true;
    rightBldg.receiveShadow = true;
    rightWing.add(rightBldg);
    campus.add(rightWing);

    this.scene.add(campus);
    this.objects.campus = campus;
  }

  buildFoliage() {
    const trees = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2618, roughness: 0.9 });
    const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x2c6353, roughness: 0.7, flatShading: true });
    const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x6a9486, roughness: 0.8, flatShading: true });

    const treePositions = [
      { x: -5.5, z: 6.5, scale: 1.1 },
      { x: 5.8, z: 6.5, scale: 1.0 },
      { x: -7, z: 1.5, scale: 1.3 },
      { x: 7.2, z: 2.0, scale: 1.2 },
      { x: -8.5, z: -8, scale: 1.4 },
      { x: 9.0, z: -7, scale: 1.5 },
      { x: -11, z: -15, scale: 1.6 },
      { x: 11, z: -14, scale: 1.5 }
    ];

    treePositions.forEach((pos) => {
      const tree = new THREE.Group();
      tree.position.set(pos.x, 0, pos.z);
      tree.scale.set(pos.scale, pos.scale, pos.scale);

      // Trunk
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.4, 6), trunkMat);
      trunk.position.y = 1.2;
      trunk.castShadow = true;
      tree.add(trunk);

      // Geometric low-poly foliage tiers
      const f1 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.2, 6), leavesMat1);
      f1.position.y = 2.8;
      f1.castShadow = true;
      tree.add(f1);

      const f2 = new THREE.Mesh(new THREE.ConeGeometry(1.2, 1.8, 6), leavesMat2);
      f2.position.y = 3.8;
      f2.castShadow = true;
      tree.add(f2);

      trees.add(tree);
    });

    this.scene.add(trees);
  }

  buildCharacters() {
    const chars = new THREE.Group();

    // 1. Fresher / Junior Student (approaching gate at z=8.5)
    const junior = new THREE.Group();
    junior.position.set(0.6, 0, 9.2);

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xc98d63, roughness: 0.6 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 }); // Bright cyan hoodie
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });
    const backpackMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 }); // Orange backpack

    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), shirtMat);
    torso.position.y = 1.25;
    torso.castShadow = true;
    junior.add(torso);

    // Backpack
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.55, 0.22), backpackMat);
    backpack.position.set(0, 1.22, 0.22);
    backpack.castShadow = true;
    junior.add(backpack);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
    head.position.y = 1.75;
    junior.add(head);

    // Legs
    const leftLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9), pantsMat);
    leftLeg.position.set(-0.14, 0.45, 0.1);
    leftLeg.rotation.x = 0.2;
    junior.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9), pantsMat);
    rightLeg.position.set(0.14, 0.45, -0.1);
    rightLeg.rotation.x = -0.2;
    junior.add(rightLeg);

    chars.add(junior);
    this.objects.junior = junior;

    // 2. Senior Guide (standing inside gate near lawn at z=2.2)
    const senior = new THREE.Group();
    senior.position.set(2.4, 0, 2.6);
    senior.rotation.y = -Math.PI / 4; // facing incoming junior

    const seniorShirt = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.5 }); // Green tech jacket

    const sTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.75, 0.3), seniorShirt);
    sTorso.position.y = 1.25;
    sTorso.castShadow = true;
    senior.add(sTorso);

    const sHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
    sHead.position.y = 1.78;
    senior.add(sHead);

    // Senior Waving Arm!
    const armGroup = new THREE.Group();
    armGroup.position.set(-0.3, 1.5, 0);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.5), seniorShirt);
    arm.position.y = 0.25;
    armGroup.add(arm);
    armGroup.rotation.z = Math.PI / 3; // raised arm waving
    senior.add(armGroup);
    this.objects.seniorArm = armGroup;

    chars.add(senior);
    this.objects.senior = senior;

    this.scene.add(chars);
  }

  buildAtmosphere() {
    // Drifting glowing dust particles / fireflies
    const particleCount = 200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 40;
      positions[i + 1] = Math.random() * 12 + 0.5;
      positions[i + 2] = (Math.random() - 0.5) * 50;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.15,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  onResize() {
    if (!this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  onMouseMove(e) {
    this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }

  onScroll() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight > 0) {
      this.targetScroll = window.scrollY / docHeight;
    }
  }

  setExplicitProgress(progress) {
    this.targetScroll = Math.max(0, Math.min(1, progress));
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth scroll interpolation
    this.scrollProgress += (this.targetScroll - this.scrollProgress) * 0.08;

    // Smooth mouse parallax interpolation
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera trajectory driven by scroll
    // Zone 1: Gate Exterior (Scroll 0 -> 0.25)
    // Zone 2: Gate Passage & Senior Encounter (Scroll 0.25 -> 0.55)
    // Zone 3: Campus Quad & Elevated View (Scroll 0.55 -> 1.0)
    const p = this.scrollProgress;

    let targetCamX = 0 + this.mouse.x * 0.8;
    let targetCamY = 3.2 - p * 0.5 + Math.sin(p * Math.PI) * 1.5 - this.mouse.y * 0.4;
    let targetCamZ = 14 - p * 24; // Dollies from z=14 through gate (z=4.5) to z=-10

    let lookTargetZ = targetCamZ - 8;
    let lookTargetY = 2.0 + p * 1.2;

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.1;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.1;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.1;

    this.camera.lookAt(0, lookTargetY, lookTargetZ);

    // Junior character walking animation
    if (this.objects.junior) {
      // Junior walks towards gate as you scroll down
      this.objects.junior.position.z = 9.2 - p * 12;
      this.objects.junior.position.y = Math.abs(Math.sin(time * 6)) * 0.06; // subtle walking bob
    }

    // Senior waving arm animation
    if (this.objects.seniorArm) {
      this.objects.seniorArm.rotation.z = Math.PI / 3 + Math.sin(time * 5) * 0.25;
    }

    // Particles gentle drift
    if (this.particles) {
      const positions = this.particles.geometry.attributes.position.array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += Math.sin(time + positions[i]) * 0.005;
      }
      this.particles.geometry.attributes.position.needsUpdate = true;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.Campus3DScene = Campus3DScene;

