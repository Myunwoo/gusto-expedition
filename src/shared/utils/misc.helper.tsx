/**
 * 해시 변경을 감지 유틸(비동기)
 */
export const waitForHashChange = async (func: () => void) => {
  if (typeof window === 'undefined') {
    func()
    return
  }

  const currentHash = window.location.hash

  func() // 해시 변경 함수 실행
  return await new Promise((resolve) => {
    const intervalId = setInterval(() => {
      if (window.location.hash !== currentHash) {
        console.log('waitForHashChange 해시 변경 감지')
        clearInterval(intervalId)
        resolve(true)
      }
    }, 100) // 100ms마다 체크
  })
}