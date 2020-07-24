const api = require('NeteaseCloudMusicApi')

async function Do () {
  // 定义区，提供了使用 Cookie 和使用手机号登录的方法
  let cookie = '' // 如果为空接下来会尝试使用手机号登录

  // 如果需要使用手机登录的话，请定义以下区域
  const phone = '' // 手机号
  const countrycode = '86' // 手机区号
  const password = '' // 密码
  const isMD5Password = false // 如果密码传入的是 md5 密码则将此项改为 true
  
  // 歌单 ID，貌似云函数没提供缓存之类的东西，因此每个月辛苦点自己更换歌单 ID 吧！
  const playlistID = ''

  if  (!cookie) { // 如果 cookie 为空，则尝试使用手机登录
    console.log('尝试使用手机登录...')
    const options = {
      phone,
      countrycode
    }
    if (isMD5Password) {
      options.md5_password = password
    } else {
      options.password = password
    }
    try {
      const result = await api.login_cellphone(options)
      cookie = result.body.cookie
      console.log(cookie)
    } catch (err) {
      console.log(err)
      process.exit(1)
    }
  }
  // 流程一：签到
  console.log('开始签到...')
  console.log(await api.daily_signin({
    type: 0, // 签到安卓端,
    cookie
  }))
  console.log(await api.daily_signin({
    type: 1, // 签到 PC 端
    cookie
  }))

  // 流程二：收藏日推
  console.log('开始收藏日推...')
  data = await api.recommend_songs({
    cookie
  })
  if (data.body.code != 200) {
    console.error(data)
    throw new Error('获得日推数据失败')
  }
  const ids = []
  data.body.data.dailySongs.forEach(v => {
    ids.push(v.id.toString())
  })
  console.log('ids: ') 
  console.log(ids)
  console.log(await api.playlist_tracks({
    op: 'add',
    pid: playlistID,
    tracks: ids.join(','),
    cookie
  }))
  console.log('执行完成！')
}

exports.main = () => {
  Do()
    .catch(err => {
      console.log(err)
      process.exit(1)
    })
}
