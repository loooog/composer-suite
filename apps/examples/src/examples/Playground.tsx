import { useFrame } from "@react-three/fiber"
import { useMemo } from "react"
import {
  Add,
  compileShader,
  CustomShaderMaterialMaster,
  Float,
  Fresnel,
  Join,
  Multiply,
  PerlinNoise,
  Sin,
  Time,
  VertexPosition
} from "shadenfreude"
import { Color, MeshStandardMaterial } from "three"
import CustomShaderMaterial from "three-custom-shader-material"

// const noiseFunctions = `
// //
// // GLSL textureless classic 3D noise "cnoise",
// // with an RSL-style periodic variant "pnoise".
// // Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// // Version: 2011-10-11
// //
// // Many thanks to Ian McEwan of Ashima Arts for the
// // ideas for permutation and gradient selection.
// //
// // Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// // Distributed under the MIT license. See LICENSE file.
// // https://github.com/stegu/webgl-noise
// //

// ${taylorInvSqrt.chunk}
// ${fade.chunk}
// ${permute.chunk}

// // Classic Perlin noise
// float cnoise(vec3 P)
// {
//   vec3 Pi0 = floor(P); // Integer part for indexing
//   vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
//   Pi0 = ${mod289.name}(Pi0);
//   Pi1 = ${mod289.name}(Pi1);
//   vec3 Pf0 = fract(P); // Fractional part for interpolation
//   vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
//   vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
//   vec4 iy = vec4(Pi0.yy, Pi1.yy);
//   vec4 iz0 = Pi0.zzzz;
//   vec4 iz1 = Pi1.zzzz;

//   vec4 ixy = ${permute.name}(${permute.name}(ix) + iy);
//   vec4 ixy0 = ${permute.name}(ixy + iz0);
//   vec4 ixy1 = ${permute.name}(ixy + iz1);

//   vec4 gx0 = ixy0 * (1.0 / 7.0);
//   vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
//   gx0 = fract(gx0);
//   vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
//   vec4 sz0 = step(gz0, vec4(0.0));
//   gx0 -= sz0 * (step(0.0, gx0) - 0.5);
//   gy0 -= sz0 * (step(0.0, gy0) - 0.5);

//   vec4 gx1 = ixy1 * (1.0 / 7.0);
//   vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
//   gx1 = fract(gx1);
//   vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
//   vec4 sz1 = step(gz1, vec4(0.0));
//   gx1 -= sz1 * (step(0.0, gx1) - 0.5);
//   gy1 -= sz1 * (step(0.0, gy1) - 0.5);

//   vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
//   vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
//   vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
//   vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
//   vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
//   vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
//   vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
//   vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

//   vec4 norm0 = ${
//     taylorInvSqrt.name
//   }(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
//   g000 *= norm0.x;
//   g010 *= norm0.y;
//   g100 *= norm0.z;
//   g110 *= norm0.w;
//   vec4 norm1 = ${
//     taylorInvSqrt.name
//   }(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
//   g001 *= norm1.x;
//   g011 *= norm1.y;
//   g101 *= norm1.z;
//   g111 *= norm1.w;

//   float n000 = dot(g000, Pf0);
//   float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
//   float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
//   float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
//   float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
//   float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
//   float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
//   float n111 = dot(g111, Pf1);

//   vec3 fade_xyz = ${fade.name}(Pf0);
//   vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
//   vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
//   float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
//   return 2.2 * n_xyz;
// }

// ${pNoise.chunk}

// `

// const Turbulence = () => {
//   const turbulence = snippet(
//     (name) =>
//       `
//       float ${name}(vec3 p) {
//         float w = 100.0;
//         float t = -0.3;

//         for (float f = 1.0 ; f <= 10.0 ; f++) {
//           float power = pow( 2.0, f );
//           t += abs( ${pNoise.name}( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
//         }

//         return t;
//       }
//     `,
//     [pNoise]
//   )

//   return Float(`${turbulence.name}(.5 * normal + time * 0.4)`, {
//     inputs: {
//       time: Time
//     },
//     varying: true,
//     vertexHeader: [turbulence]
//   })
// }

// const MonolithicVertexDisplacement = (
//   amplitude: Float = 1,
//   amplitude2: Float = 1
// ) =>
//   Vec3(new Vector3(), {
//     only: "vertex",

//     inputs: {
//       time: Time,
//       amplitude,
//       amplitude2,
//       turbulence: Turbulence()
//     },

//     vertexHeader: [pNoise],

//     vertexBody: `
//       float noise = ${pNoise.name}( 10.0 * position, vec3( 100.0 ) );
//       float displacement = amplitude2 * turbulence + amplitude * noise;
//       vec3 newPosition = position + normal * displacement;
//       value = newPosition;
//     `
//   })

export default function Playground() {
  const [shader, update] = useMemo(() => {
    const Wobble = (frequency: Float, amplitude: Float) =>
      Multiply(Sin(Multiply(Time, frequency)), amplitude)

    const fresnel = Fresnel()

    const p = PerlinNoise(VertexPosition, Join(Time, Time, Time))
    const root = CustomShaderMaterialMaster({
      position: Multiply(VertexPosition, Add(Multiply(p, 0.2), 1.0)),

      diffuseColor: Multiply(new Color(10, 0.8, 0.2), p)
    })

    return compileShader(root)
  }, [])

  useFrame((_, dt) => update(dt))

  console.log(shader.vertexShader)
  console.log(shader.fragmentShader)

  return (
    <group position-y={15}>
      <mesh>
        <icosahedronGeometry args={[8, 64]} />

        <CustomShaderMaterial
          baseMaterial={MeshStandardMaterial}
          {...shader}
          transparent
        />
      </mesh>
    </group>
  )
}
