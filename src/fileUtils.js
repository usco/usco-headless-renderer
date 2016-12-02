// file utils ??
export function getExtension (fname) {
  return fname.substr((~-fname.lastIndexOf('.') >>> 0) + 2).toLowerCase()
}

export function getNameAndExtension (uri) {
  const _uriElems = uri.split('?')
  const name = _uriElems.shift().split('/').pop()
  const ext = getExtension(uri)
  return {name, ext}
}

export function isValidFile (file) {
  return ((typeof file !== 'undefined' && file !== null) && file instanceof File)
}
