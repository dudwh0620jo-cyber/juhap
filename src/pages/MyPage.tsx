import { useState } from "react"
import { readUserProfile } from "../data/userProfile"
import { defaultFollowedUserIdsMock } from "../utils/usersMock"
import { COMMUNITY_FOLLOWED_USERS_KEY } from "../utils/communityStorage"
import { useStoredNumberSet } from "../utils/storage"
import "../styles/my.css"

const activityStats = [
  { value: 47, label: "기록" },
  { value: 23, label: "투표 참여" },
  { value: 8, label: "후기 작성" },
  { value: 14, label: "저장" },
]

const tasteBars = [
  { label: "바디", value: 35, level: "가벼움", className: "body" },
  { label: "쓴맛", value: 75, level: "강함", className: "bitter" },
  { label: "단맛", value: 30, level: "약함", className: "sweet" },
  { label: "탄산", value: 60, level: "중간", className: "sparkle" },
]

const activeTags = ["#쓴맛", "#라이트바디", "#과일향", "#혼술", "#크래프트맥주", "#전통주", "#가성비"]
const quietTags = ["기피 #단술", "기피 #RTD"]

export default function MyPage() {
  const profile = readUserProfile()
  const [isTasteOpen, setIsTasteOpen] = useState(true)
  const { value: followedUserIds } = useStoredNumberSet(COMMUNITY_FOLLOWED_USERS_KEY, defaultFollowedUserIdsMock)
  const nickname = profile.personalInfo.nickname.trim() || "이름"

  return (
    <section className="my_page" aria-label="마이페이지">
      <header className="my_profile_header">
        <div className="my_profile_avatar" aria-hidden="true" />

        <div className="my_profile_identity">
          <h1>{nickname}</h1>
          <div className="my_grade_line">
            <span>등급</span>
            <span className="user_grade_badge is_tier3">큐레이터</span>
          </div>
        </div>

        <div className="my_social_summary" aria-label="팔로우 정보">
          <strong>팔로워 74</strong>
          <span>/</span>
          <strong>팔로잉 {followedUserIds.size}</strong>
        </div>

        <button type="button" className="my_edit_button">
          수정
        </button>
      </header>

      <div className="my_page_body">
        <section className="my_activity_section" aria-labelledby="my-activity-title">
          <h2 id="my-activity-title">활동 데이터</h2>
          <div className="my_activity_grid">
            {activityStats.map((stat) => (
              <article className="my_activity_card" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="my_taste_summary" aria-label="취향 요약">
          <span className="my_taste_drop" aria-hidden="true">
            💧
          </span>
          <p>
            <strong>쓴맛 중심·라이트 바디</strong> 선호, <strong>혼술 多</strong>, 과일향 좋아함.
            <br />
            <span>"빠르게 결정하는 가성비 탐험가 스타일이에요."</span>
          </p>
          <button
            type="button"
            className={isTasteOpen ? "my_taste_toggle is_open" : "my_taste_toggle"}
            aria-label={isTasteOpen ? "내 취향 프로필 접기" : "내 취향 프로필 펼치기"}
            aria-expanded={isTasteOpen}
            aria-controls="my-taste-profile"
            onClick={() => setIsTasteOpen((current) => !current)}
          />
        </section>

        {isTasteOpen && (
          <section className="my_taste_profile" id="my-taste-profile" aria-labelledby="my-taste-profile-title">
            <div className="my_section_header">
              <h2 id="my-taste-profile-title">내 취향 프로필</h2>
              <button type="button" className="my_outline_button">
                수정
              </button>
            </div>

            <div className="my_taste_card">
              <div className="my_taste_bars">
                {tasteBars.map((bar) => (
                  <div className="my_taste_bar_row" key={bar.label}>
                    <span>{bar.label}</span>
                    <div className="my_taste_bar_track" aria-hidden="true">
                      <span className={`my_taste_bar_fill ${bar.className}`} style={{ width: `${bar.value}%` }} />
                    </div>
                    <strong>{bar.level}</strong>
                  </div>
                ))}
              </div>

              <div className="my_tag_group" aria-label="선호 태그">
                {activeTags.map((tag) => (
                  <span className="my_tag is_active" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <div className="my_tag_group is_muted" aria-label="기피 태그">
                {quietTags.map((tag) => (
                  <span className="my_tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <p className="my_ai_note">
                <span>AI 분석</span>
                "빠르게 결정하는 스타일이에요. 가성비 중심으로 새로운 걸 자주 시도해요."
              </p>
            </div>
          </section>
        )}

        <section className="my_points_section" aria-labelledby="my-points-title">
          <div className="my_section_header">
            <h2 id="my-points-title">포인트</h2>
            <button type="button" className="my_link_button">
              교환소
            </button>
          </div>

          <div className="my_point_card">
            <span>보유 포인트</span>
            <strong>2,840 P</strong>
            <div className="my_point_progress" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <span className="is_empty" />
            </div>
            <p>
              파트너 바 시음 체험권까지 <strong>160P</strong> 남았어요
            </p>
          </div>
        </section>

        <nav className="my_setting_list" aria-label="마이페이지 설정">
          <a href="/profile-setup">
            <span>계정 / 보안 설정</span>
            <small>프로필 편집 · 인증 · 탈퇴</small>
          </a>
          <a href="/home">
            <span>도움말 & 문의</span>
            <small>고객 지원 센터</small>
          </a>
        </nav>
      </div>
    </section>
  )
}
