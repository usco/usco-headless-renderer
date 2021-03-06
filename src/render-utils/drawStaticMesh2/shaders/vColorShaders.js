const vColorVert = `precision mediump float;
#define GLSLIFY 1

uniform float camNear, camFar;
uniform mat4 model, view, projection;

attribute vec3 position, normal;
attribute vec4 color;

varying vec3 fragNormal, fragPosition;
varying vec4 _worldSpacePosition;
varying vec4 vColor;

vec4 zBufferAdjust(vec4 glPosition, float camNear, float camFar)
{
  glPosition.z = 2.0*log(glPosition.w/camNear)/log(camFar/camNear) - 1.;
  glPosition.z *= glPosition.w;
  return glPosition;
}

void main() {
  fragPosition = position;
  fragNormal = normal;
  vec4 worldSpacePosition = model * vec4(position, 1);
  _worldSpacePosition = worldSpacePosition;
  //gl_Position = projection * view * worldSpacePosition;

  vColor = color;

  vec4 glPosition = projection * view * model * vec4(position, 1);
  gl_Position = glPosition;
  //gl_Position = zBufferAdjust(glPosition, camNear, camFar);
}
`
const vColorFrag = `/*precision mediump float;

uniform vec4 color;
varying vec3 vnormal;
varying vec3 fragNormal, fragPosition;

void main() {
  //gl_FragColor = color;
  gl_FragColor = vec4(abs(fragNormal), 1.0);
}*/



precision mediump float;
varying vec3 fragNormal;
uniform float ambientLightAmount;
uniform float diffuseLightAmount;

uniform vec3 lightDir;
uniform vec3 opacity;

varying vec4 _worldSpacePosition;
varying vec4 vColor;

uniform vec2 printableArea;

vec4 errorColor = vec4(0.15, 0.15, 0.15, 0.3);//vec4(0.15, 0.15, 0.15, 0.3);



void main () {
  vec4 depth = gl_FragCoord;

  float v = 0.8; // shadow value
  vec4 endColor = vColor;//color;

  //if anything is outside the printable area, shade differently
  /*if(_worldSpacePosition.x>printableArea.x*0.5 || _worldSpacePosition.x<-printableArea.x*0.5){
    endColor = errorColor;
  }
  if(_worldSpacePosition.y>printableArea.y*0.5 || _worldSpacePosition.y<printableArea.y*-0.5) {
    endColor = errorColor;
  }*/

  vec3 ambient = ambientLightAmount * endColor.rgb;
  float cosTheta = dot(fragNormal, lightDir);
  vec3 diffuse = diffuseLightAmount * endColor.rgb * clamp(cosTheta , 0.0, 1.0 );

  float cosTheta2 = dot(fragNormal, vec3(-lightDir.x, -lightDir.y, lightDir.z));
  vec3 diffuse2 = diffuseLightAmount * endColor.rgb * clamp(cosTheta2 , 0.0, 1.0 );

  gl_FragColor = vec4((ambient + diffuse + diffuse2 * v), endColor.a);
}
`

export default { frag: vColorFrag, vert: vColorVert }
