export const accretionDiskVertexShader = `
  varying vec2 vUv;
  varying vec3 vPos;
  varying float vDoppler;

  void main() {
    vUv = uv;
    vPos = position;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec3 objectVelocity = normalize(vec3(-position.y, position.x, 0.0));
    vec3 viewVelocity = normalize(normalMatrix * objectVelocity);
    vec3 viewDir = normalize(-mvPosition.xyz);
    vDoppler = dot(viewVelocity, viewDir);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const accretionDiskFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorMid;
  uniform vec3 uColorOuter;

  varying vec2 vUv;
  varying vec3 vPos;
  varying float vDoppler;

  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
  float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 6; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float r = length(vPos.xy);
    float innerR = 1.8;
    float outerR = 4.5;
    float normalizedR = clamp((r - innerR) / (outerR - innerR), 0.0, 1.0);
    if (r < innerR || r > outerR) discard;
    float angle = atan(vPos.y, vPos.x);
    float speed = 2.5 / (r + 0.1); 
    float twistedAngle = angle - uTime * speed + r * 3.0;
    vec2 twistedPos = vec2(cos(twistedAngle), sin(twistedAngle));
    vec2 uvNoise = twistedPos * (r * 2.0) + vec2(uTime * 0.2, uTime * 0.3);
    float n = fbm(uvNoise);
    float ringNoise = fbm(vec2(r * 12.0, uTime * 0.4));
    float intensity = n * (0.6 + 0.4 * ringNoise);
    float sAngle = angle - uTime * 12.0;
    vec2 sPos = vec2(cos(sAngle), sin(sAngle));
    vec2 streakUV = vec2(sPos.x * 2.5 + sPos.y * 2.5, r * 30.0 - uTime * 5.0);
    float streakNoise = fbm(streakUV);
    streakNoise = pow(streakNoise, 3.0) * 5.0;

    float streakMask = smoothstep(0.3, 0.0, normalizedR);
    intensity += streakNoise * streakMask;
    float fade = smoothstep(0.0, 0.1, normalizedR) * smoothstep(1.0, 0.3, normalizedR);
    float innerGlow = smoothstep(0.2, 0.0, normalizedR);

    float beaming = smoothstep(-1.0, 1.0, vDoppler);
    float dopplerAlphaMult = mix(0.3, 2.0, beaming);
    vec3 baseColor = mix(uColorInner, uColorMid, smoothstep(0.0, 0.4, normalizedR));
    baseColor = mix(baseColor, uColorOuter, smoothstep(0.3, 1.0, normalizedR));
    vec3 dopplerColorShift = mix(vec3(0.3, 0.0, 0.5), vec3(0.9, 1.0, 1.0), beaming);
    vec3 color = mix(baseColor, dopplerColorShift, 0.6);
    float pulsePhase = fract(uTime / 2.5);
    float coreIgnition = exp(-pulsePhase * 25.0) * smoothstep(0.2, 0.0, normalizedR);
    float shockPos = pulsePhase * 1.2;
    float shockThickness = mix(40.0, 15.0, pulsePhase); 
    float shockwave = exp(-abs(normalizedR - shockPos) * shockThickness) * exp(-pulsePhase * 4.0);
    float plasmaNoise = fbm(vec2(angle * 12.0 - uTime * 25.0, r * 6.0 - pulsePhase * 15.0));
    float tearingPlasma = pow(max(plasmaNoise, 0.0), 2.0) * shockwave * 12.0;

    vec3 coreColor = vec3(1.0, 1.0, 1.0) * coreIgnition * 3.0;
    vec3 shockColor = vec3(0.3, 0.8, 1.0) * shockwave * 2.5;
    vec3 plasmaColor = vec3(0.8, 0.3, 1.0) * tearingPlasma * 1.5;

    vec3 burstColor = coreColor + shockColor + plasmaColor;

    color = mix(color, vec3(1.0, 1.0, 1.0), innerGlow * 0.7);
    color += burstColor;

    float alpha = intensity * fade * 1.8 * dopplerAlphaMult;
    alpha += innerGlow * 0.9 * dopplerAlphaMult;
    alpha += (coreIgnition * 2.5 + shockwave * 2.0 + tearingPlasma) * fade * dopplerAlphaMult;

    gl_FragColor = vec4(color * alpha, min(alpha, 1.0));
  }
`;

export const lensingVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDoppler;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;

    vec3 objectVelocity = normalize(vec3(-position.z, 0.0, position.x));
    vec3 viewVelocity = normalize(normalMatrix * objectVelocity);
    vec3 viewDir = normalize(vViewPosition);
    vDoppler = dot(viewVelocity, viewDir);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const lensingFragmentShader = `
  uniform float uTime;
  uniform vec3 uColorInner;
  uniform vec3 uColorMid;
  uniform vec3 uColorOuter;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying float vDoppler;

  float hash(vec2 p) { return fract(1e4 * sin(17.0 * p.x + p.y * 0.1) * (0.1 + abs(sin(p.y * 13.0 + p.x)))); }
  float noise(vec2 x) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 x) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 4; ++i) {
      v += a * noise(x);
      x = rot * x * 2.0 + shift;
      a *= 0.5;
    }
    return v;
  }

  void main() {
     vec3 normal = normalize(vNormal);
     vec3 viewDir = normalize(vViewPosition);

     float viewDot = dot(normal, viewDir);
     float rim = 1.0 - max(viewDot, 0.0);
     float haloIntensity = smoothstep(0.75, 1.0, rim);
     if (haloIntensity <= 0.01) discard;
     float r = 1.8 + abs(normal.y) * 2.7;
     float angle = atan(normal.z, normal.x);

     float speed = 2.5 / (r + 0.1);
     float twistedAngle = angle - uTime * speed + r * 3.0;

     vec2 twistedPos = vec2(cos(twistedAngle), sin(twistedAngle));
     vec2 uvNoise = twistedPos * (r * 2.0) + vec2(uTime * 0.2, uTime * 0.3);
     float n = fbm(uvNoise);

     float normalizedR = clamp((r - 1.8) / 2.7, 0.0, 1.0);
     float sAngle = angle - uTime * 12.0;
     vec2 sPos = vec2(cos(sAngle), sin(sAngle));
     vec2 streakUV = vec2(sPos.x * 2.5 + sPos.y * 2.5, r * 30.0 - uTime * 5.0);
     float streakNoise = fbm(streakUV);
     streakNoise = pow(streakNoise, 3.0) * 5.0;

     float streakMask = smoothstep(0.4, 0.0, normalizedR);
     n += streakNoise * streakMask;
     float beaming = smoothstep(-1.0, 1.0, vDoppler);
     float dopplerAlphaMult = mix(0.5, 2.0, beaming); 

     vec3 baseColor = mix(uColorInner, uColorMid, smoothstep(0.0, 0.4, normalizedR));
     baseColor = mix(baseColor, uColorOuter, smoothstep(0.3, 1.0, normalizedR));

     vec3 dopplerColorShift = mix(vec3(0.3, 0.0, 0.5), vec3(0.9, 1.0, 1.0), beaming);
     vec3 color = mix(baseColor, dopplerColorShift, 0.5);
     float pulsePhase = fract(uTime / 2.5);
     float coreIgnition = exp(-pulsePhase * 25.0) * smoothstep(0.2, 0.0, normalizedR);
     float shockPos = pulsePhase * 1.2;
     float shockThickness = mix(40.0, 15.0, pulsePhase); 
     float shockwave = exp(-abs(normalizedR - shockPos) * shockThickness) * exp(-pulsePhase * 4.0);
     float plasmaNoise = fbm(vec2(angle * 12.0 - uTime * 25.0, r * 6.0 - pulsePhase * 15.0));
     float tearingPlasma = pow(max(plasmaNoise, 0.0), 2.0) * shockwave * 12.0;

     vec3 coreColor = vec3(1.0, 1.0, 1.0) * coreIgnition * 3.0;
     vec3 shockColor = vec3(0.3, 0.8, 1.0) * shockwave * 2.5;
     vec3 plasmaColor = vec3(0.8, 0.3, 1.0) * tearingPlasma * 1.5;

     vec3 burstColor = coreColor + shockColor + plasmaColor;

     color += burstColor;

     float poleFade = 1.0 - pow(abs(normal.y), 3.0);

     float alpha = n * haloIntensity * poleFade * 2.5 * dopplerAlphaMult;
     alpha += (coreIgnition * 2.5 + shockwave * 2.0 + tearingPlasma) * haloIntensity * poleFade * dopplerAlphaMult;

     gl_FragColor = vec4(color * alpha, min(alpha, 1.0));
  }
`;

export const planetVertexShader = `
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying mat3 vNormalMatrix;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }
  float getElevation(vec3 pos, float time) {
      vec3 noisePos = pos * 2.5 + vec3(time, time * 0.5, 0.0);
      float n1 = fbm(noisePos);
      return smoothstep(0.4, 0.65, n1);
  }

  void main() {
    vPos = position;
    vNormalMatrix = normalMatrix;
    float time = uTime * 0.15;
    float elevation = getElevation(position, time);
    float displacement = elevation * 0.15;

    vec3 displacedPosition = position + normal * displacement;

    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const planetFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uEmissiveIntensity;
  uniform float uHasRings;

  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying mat3 vNormalMatrix;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  float getElevation(vec3 pos, float time) {
      vec3 noisePos = pos * 2.5 + vec3(time, time * 0.5, 0.0);
      float n1 = fbm(noisePos);
      return smoothstep(0.4, 0.65, n1);
  }

  void main() {
      float time = uTime * 0.15;
      float elevation = getElevation(vPos, time);
      float landMask = elevation;
      float e = 0.01;
      float dx = getElevation(vPos + vec3(e, 0.0, 0.0), time) - elevation;
      float dy = getElevation(vPos + vec3(0.0, e, 0.0), time) - elevation;
      float dz = getElevation(vPos + vec3(0.0, 0.0, e), time) - elevation;

      vec3 localGrad = vec3(dx, dy, dz) / e;
      vec3 localBaseNormal = normalize(vPos);

      vec3 localNormal = normalize(localBaseNormal - localGrad * 0.4);

      vec3 normal = normalize(vNormalMatrix * localNormal);
      vec3 viewDir = normalize(vViewPosition);
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      vec3 cloudShadowPos = (vPos + lightDir * 0.05) * 2.0 + vec3(0.0, 0.0, time * 1.5);
      float nShadow = fbm(cloudShadowPos);
      float cloudShadowMask = smoothstep(0.5, 0.9, nShadow);
      float ringShadow = 1.0;
      if (uHasRings > 0.5) {
          float tRing = -vPos.y / lightDir.y;
          if (tRing > 0.0) {
              vec3 hitPos = vPos + tRing * lightDir;
              float hitDist = length(hitPos);
              float r = length(vPos); 

              float hitMask = smoothstep(r * 1.35, r * 1.5, hitDist) * (1.0 - smoothstep(r * 2.3, r * 2.45, hitDist));
              float ringNoise = fbm(hitPos * 10.0);
              float ringDensity = hitMask * (0.4 + 0.6 * ringNoise);
              ringShadow = mix(1.0, 0.2, ringDensity);
          }
      }
      vec3 oceanColor = uColor * 0.15;
      vec3 landColor = mix(uColor * 0.8, vec3(1.0), 0.2);
      vec3 surfaceColor = mix(oceanColor, landColor, landMask);
      float diff = max(dot(normal, lightDir), 0.0);
      float ambient = 0.15;
      float shadowFactor = 1.0 - (cloudShadowMask * 0.85);
      vec3 halfVector = normalize(lightDir + viewDir);
      float spec = pow(max(dot(normal, halfVector), 0.0), 32.0);
      float specularLight = spec * (1.0 - landMask) * 0.8;
      diff = diff * 0.8 + 0.2;
      vec3 lightedSurface = surfaceColor * (diff * shadowFactor * ringShadow + ambient) + (specularLight * shadowFactor * ringShadow * uColor);
      float nightMask = 1.0 - smoothstep(0.0, 0.25, dot(normal, lightDir));
      vec3 cityPos = vPos * 30.0;
      float cityNoise1 = fbm(cityPos);
      float cityNoise2 = fbm(cityPos * 2.0 + vec3(time * 0.1));
      float citySpot = pow(cityNoise1, 3.0) * 8.0;
      float cityPattern = clamp(citySpot * smoothstep(0.3, 0.7, cityNoise2), 0.0, 1.0);
      float cityGlow = cityPattern * landMask * nightMask * (1.0 - cloudShadowMask * 0.8);
      vec3 glowColor = mix(uColor, vec3(1.0), 0.6) * 4.0;
      lightedSurface += glowColor * cityGlow;
      float NdotL = dot(normal, lightDir);
      float terminatorGlow = smoothstep(-0.15, 0.2, NdotL) * smoothstep(0.2, -0.15, NdotL);
      vec3 sunsetColor = mix(vec3(0.9, 0.4, 0.1), uColor, 0.3);
      lightedSurface += sunsetColor * terminatorGlow * (1.0 - cloudShadowMask * 0.5) * ringShadow * 0.8;
      vec3 baseViewNormal = normalize(vNormalMatrix * localBaseNormal);
      float fresnel = dot(viewDir, baseViewNormal);
      float rimNdotL = dot(localBaseNormal, lightDir);
      float nightFade = smoothstep(-0.4, 0.1, rimNdotL);
      vec3 rimColor = mix(sunsetColor, uColor, smoothstep(-0.2, 0.5, rimNdotL));
      float atmosphereRim = smoothstep(0.0, 0.8, 1.0 - max(fresnel, 0.0));
      float edgeHalo = pow(max(1.0 - fresnel, 0.0), 3.0);
      vec3 finalColor = lightedSurface;
      finalColor += rimColor * atmosphereRim * nightFade * 0.6; 
      finalColor += mix(vec3(1.0), rimColor, 0.5) * edgeHalo * nightFade * 1.2;
      finalColor *= uEmissiveIntensity * 1.5;

      gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export const cloudVertexShader = `
  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vPos = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const cloudFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uEmissiveIntensity;

  varying vec3 vPos;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  void main() {
      float time = uTime * 0.15;
      vec3 cloudNoisePos = vPos * 2.0 + vec3(0.0, 0.0, time * 1.5);
      float n2 = fbm(cloudNoisePos);
      float cloudMask = smoothstep(0.45, 0.85, n2);

      if (cloudMask <= 0.01) discard;

      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);

      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(dot(normal, lightDir), 0.0);
      float ambient = 0.15;

      float fresnel = max(dot(viewDir, normal), 0.0);
      float thickness = mix(0.4, 1.0, fresnel);

      vec3 baseCloudColor = mix(vec3(0.9), uColor, 0.2);
      float subScatter = pow(max(dot(viewDir, lightDir), 0.0), 4.0) * 0.4;

      vec3 lightedCloud = baseCloudColor * (diff * 0.9 + ambient + subScatter) * thickness;
      lightedCloud *= uEmissiveIntensity * 1.5;

      gl_FragColor = vec4(lightedCloud, cloudMask * 0.85);
  }
`;

export const ringVertexShader = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const ringFragmentShader = `
  uniform float uTime;
  uniform vec3 uColor;
  uniform float uEmissiveIntensity;

  varying vec3 vPos;

  float hash(vec3 p) {
      p = fract(p * vec3(443.897, 441.423, 437.195));
      p += dot(p, p.yxz + 19.19);
      return fract(p.x * p.y * p.z);
  }

  float noise(vec3 x) {
      vec3 i = floor(x);
      vec3 f = fract(x);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
          mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
              mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
          mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
              mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
      );
  }

  float fbm(vec3 x) {
      float v = 0.0;
      float a = 0.5;
      vec3 shift = vec3(100.0);
      for (int i = 0; i < 5; ++i) {
          v += a * noise(x);
          x = x * 2.0 + shift;
          a *= 0.5;
      }
      return v;
  }

  void main() {
      float dist = length(vPos);
      float angle = atan(vPos.z, vPos.x);
      vec3 polarPos = vec3(dist * 10.0, angle * 5.0, uTime * 0.1);

      float n = fbm(polarPos);
      float bands = sin(dist * 60.0) * 0.5 + 0.5;
      bands *= sin(dist * 150.0) * 0.5 + 0.5;

      float density = smoothstep(0.3, 0.7, n * bands);

      if (density < 0.05) discard;

      vec3 color = mix(uColor, vec3(1.0), density * 0.5);
      color *= (0.5 + uEmissiveIntensity * 0.5);

      gl_FragColor = vec4(color, density * 0.8);
  }
`;