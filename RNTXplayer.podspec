
Pod::Spec.new do |s|
  s.name         = "RNTXplayer"
  s.version      = "1.0.0"
  s.summary      = "RNTXplayer"
  s.description  = "RNTXplayer is dependency TXLiteAVSDK_Professional"
  s.homepage     = "https://github.com/xuqianjin/react-native-txplayer.git"
  s.license      = "MIT"
  s.author             = { "author" => "author@domain.cn" }
  s.platform     = :ios, "7.0"
  s.source       = { :git => "https://github.com/xuqianjin/react-native-txplayer.git", :tag => "master" }
  s.source_files  = "ios/RNTXplayer/*.{h,m}"
  s.requires_arc = true


  s.dependency "React"
  # 10.7之后需要强制验证License，无法播放
  s.dependency "TXLiteAVSDK_Professional","10.6.11822"

end

  
