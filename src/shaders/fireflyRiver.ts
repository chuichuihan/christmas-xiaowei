export const fireflyVertexShader = `
uniform float uTime;
uniform float uMix;

attribute float aOffset;
attribute float aSpeed;
attribute float aSize;

varying float vAlpha;

void main() {
  // Height cycle (0 to 12), loops continuously
  float loopTime = 12.0;
  float t = mod(uTime * aSpeed + aOffset * loopTime, loopTime);
  float h = t;

  // Cone radius: 3.8 at h=0, 0 at h=12.5
  float coneRadius = 3.8 * (1.0 - h / 12.5);

  // Spiral angle: base rotation + time rotation + height-based twist
  float angle = aOffset * 6.28318 + uTime * 0.8 + h * 1.2;

  // Organic wobble
  float wobbleR = sin(uTime * 2.5 + aOffset * 12.0) * 0.15;
  float wobbleY = cos(uTime * 2.0 + aOffset * 9.0) * 0.1;

  // Orbit radius: expanded to flow AROUND the tree, not on it
  float riverRadius = coneRadius + 0.6 + wobbleR;
  vec3 pos = vec3(
    cos(angle) * riverRadius,
    h + wobbleY,
    sin(angle) * riverRadius
  );

  // Fade in/out at boundaries
  float fadeIn = smoothstep(0.0, 1.5, h);
  float fadeOut = 1.0 - smoothstep(10.5, 12.0, h);
  vAlpha = fadeIn * fadeOut * uMix;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Size with breathing pulse
  float pulse = 1.0 + 0.35 * sin(uTime * 4.0 + aOffset * 15.0);
  gl_PointSize = aSize * pulse * (180.0 / -mvPosition.z);
}
`

export const fireflyFragmentShader = `
varying float vAlpha;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);

  // Soft circular glow with hot center
  float strength = 1.0 - smoothstep(0.0, 0.5, dist);
  strength = pow(strength, 1.8);

  // Warm firefly color (yellow-orange)
  vec3 color = vec3(1.0, 0.82, 0.28);
  // Bright white core
  color += vec3(0.6) * smoothstep(0.35, 0.0, dist);

  gl_FragColor = vec4(color, strength * vAlpha);
}
`
