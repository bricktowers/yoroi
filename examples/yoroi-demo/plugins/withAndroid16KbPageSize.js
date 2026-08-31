const fs = require('fs');
const path = require('path');

const { withDangerousMod } = require('@expo/config-plugins');

const CMAKE_FLAG = 'max-page-size=16384';
const CMAKE_SNIPPET = `
foreach(target react-native-mmkv reactnativemmkv)
  if(TARGET \${target})
    target_link_options(\${target} PRIVATE "-Wl,-z,max-page-size=16384" "-Wl,-z,common-page-size=16384")
  endif()
endforeach()
`;

// Play requires 16 KB ELF alignment on 64-bit .so files. MMKV 3 still compiles
// with NDK r27's 4 KB default, so patch its CMake at prebuild.
module.exports = function withAndroid16KbPageSize(config) {
  return withDangerousMod(config, [
    'android',
    async config => {
      const cmakePath = path.join(
        config.modRequest.projectRoot,
        'node_modules/react-native-mmkv/android/CMakeLists.txt'
      );
      if (!fs.existsSync(cmakePath)) {
        return config;
      }

      const contents = fs.readFileSync(cmakePath, 'utf8');
      if (!contents.includes(CMAKE_FLAG)) {
        fs.writeFileSync(cmakePath, `${contents.trimEnd()}\n${CMAKE_SNIPPET}`);
      }
      return config;
    },
  ]);
};
