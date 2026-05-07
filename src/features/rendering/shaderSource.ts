export const dreamShader = /* wgsl */ `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f
};

struct Uniforms {
  params: vec4f,
  resolution: vec4f
};

@group(0) @binding(0) var cameraTexture: texture_external;
@group(0) @binding(1) var cameraSampler: sampler;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  var positions = array<vec2f, 3>(
    vec2f(-1.0, -1.0),
    vec2f(3.0, -1.0),
    vec2f(-1.0, 3.0)
  );

  var output: VertexOutput;
  output.position = vec4f(positions[vertexIndex], 0.0, 1.0);
  output.uv = positions[vertexIndex] * 0.5 + vec2f(0.5);
  output.uv.y = 1.0 - output.uv.y;
  return output;
}

fn hash(point: vec2f) -> f32 {
  return fract(sin(dot(point, vec2f(127.1, 311.7))) * 43758.5453);
}

fn sampleCamera(uv: vec2f) -> vec3f {
  return textureSampleBaseClampToEdge(cameraTexture, cameraSampler, clamp(uv, vec2f(0.001), vec2f(0.999))).rgb;
}

fn luminance(color: vec3f) -> f32 {
  return dot(color, vec3f(0.2126, 0.7152, 0.0722));
}

fn dream(uv: vec2f, intensity: f32, time: f32, focus: f32) -> vec3f {
  let ripple = vec2f(
    sin((uv.y + time * 0.035) * 22.0),
    cos((uv.x - time * 0.028) * 18.0)
  ) * (0.002 + intensity * 0.009);
  let drift = ripple * (1.0 + focus * 0.65);
  let blur = 0.0025 + intensity * 0.008;
  var color = sampleCamera(uv + drift) * 0.42;
  color += sampleCamera(uv + drift + vec2f(blur, 0.0)) * 0.13;
  color += sampleCamera(uv + drift + vec2f(-blur, 0.0)) * 0.13;
  color += sampleCamera(uv + drift + vec2f(0.0, blur)) * 0.13;
  color += sampleCamera(uv + drift + vec2f(0.0, -blur)) * 0.13;
  color += vec3f(
    sampleCamera(uv + drift + vec2f(blur * 2.0, 0.0)).r,
    sampleCamera(uv + drift).g,
    sampleCamera(uv + drift - vec2f(blur * 2.0, 0.0)).b
  ) * 0.06;
  let glow = smoothstep(0.45, 1.0, luminance(color));
  let tint = vec3f(0.78, 0.92, 0.86) * glow * intensity * 0.28;
  return pow(color + tint, vec3f(0.82));
}

fn charcoal(uv: vec2f, intensity: f32, time: f32) -> vec3f {
  let texel = 1.0 / max(uniforms.resolution.xy, vec2f(1.0));
  let center = luminance(sampleCamera(uv));
  let right = luminance(sampleCamera(uv + vec2f(texel.x * 2.0, 0.0)));
  let left = luminance(sampleCamera(uv - vec2f(texel.x * 2.0, 0.0)));
  let up = luminance(sampleCamera(uv + vec2f(0.0, texel.y * 2.0)));
  let down = luminance(sampleCamera(uv - vec2f(0.0, texel.y * 2.0)));
  let edge = smoothstep(0.03, 0.24, abs(right - left) + abs(up - down));
  let grain = hash(floor(uv * uniforms.resolution.xy * 0.72) + vec2f(time * 0.8, 0.0));
  let paper = vec3f(0.88, 0.84, 0.76) + (grain - 0.5) * 0.13;
  let marks = 1.0 - smoothstep(0.18, 0.92, edge * (2.2 + intensity * 3.5) + (1.0 - center) * 0.65);
  return mix(vec3f(0.045, 0.042, 0.038), paper, marks);
}

fn albumen(uv: vec2f, intensity: f32, time: f32) -> vec3f {
  let blur = 0.0018 + intensity * 0.004;
  var color = sampleCamera(uv) * 0.55;
  color += sampleCamera(uv + vec2f(blur, blur)) * 0.15;
  color += sampleCamera(uv + vec2f(-blur, blur)) * 0.15;
  color += sampleCamera(uv + vec2f(blur, -blur)) * 0.08;
  color += sampleCamera(uv + vec2f(-blur, -blur)) * 0.07;
  let gray = luminance(color);
  var sepia = vec3f(gray * 1.12, gray * 0.91, gray * 0.62);
  let centered = uv - vec2f(0.5);
  let vignette = smoothstep(0.82, 0.22, dot(centered, centered) * 1.65);
  let scratch = step(0.992 - intensity * 0.012, hash(vec2f(floor(uv.x * 460.0), floor(time * 8.0)))) * 0.2;
  let dust = (hash(floor(uv * uniforms.resolution.xy * 0.22)) - 0.5) * 0.08;
  sepia = sepia * (0.62 + vignette * 0.48) + dust - scratch;
  return clamp(sepia, vec3f(0.0), vec3f(1.0));
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let style = uniforms.params.x;
  let intensity = uniforms.params.y;
  let time = uniforms.params.z;
  let focus = uniforms.params.w;
  let uv = input.uv;

  var color: vec3f;
  if (style < 0.5) {
    color = dream(uv, intensity, time, focus);
  } else if (style < 1.5) {
    color = charcoal(uv, intensity, time);
  } else {
    color = albumen(uv, intensity, time);
  }

  return vec4f(color, 1.0);
}
`;
