<script>
import { installPageMotion, triggerPageMotion } from './utils/pageMotion'
import { applyCachedSystemTitle, loadSystemConfig } from './utils/system'
import { applyTheme, watchSystemTheme } from './utils/theme'

export default {
  onLaunch() {
    installPageMotion()
    applyTheme()
    applyCachedSystemTitle()
    loadSystemConfig({ force: true })
    watchSystemTheme()
    triggerPageMotion()
    console.log('mobile h5 launch')
  },
  onShow() {
    applyTheme()
    applyCachedSystemTitle()
    triggerPageMotion()
  }
}
</script>

<style>
:root {
  --crm-primary: #2f6ae5;
  --crm-primary-2: #4d88ff;
  --crm-accent: #3fc0bd;
  --crm-page-bg: #f3f6fc;
  --crm-soft-bg: #eef4ff;
  --crm-hero-start: #eaf4ff;
  --crm-hero-end: #cfeaff;
  --crm-text: #17243b;
  --crm-card-bg: #ffffff;
  --crm-elevated-bg: #ffffff;
  --crm-border: #edf0f5;
  --crm-text-muted: #6c7890;
  --crm-input-bg: #f5f7fb;
  --crm-page-motion-duration: 460ms;
  --crm-page-motion-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

page {
  min-height: 100%;
  background: var(--crm-page-bg);
  color: var(--crm-text);
  font-size: 28rpx;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}

html,
body {
  background: var(--crm-page-bg);
}

uni-page,
uni-page-body,
.uni-page-body {
  background: var(--crm-page-bg);
}

:root.crm-page-animating uni-page-body > *:first-child,
:root.crm-page-animating .uni-page-body > *:first-child,
:root.crm-page-animating .crm-motion-target {
  animation: crm-page-slide-in var(--crm-page-motion-duration) var(--crm-page-motion-ease) both;
  will-change: opacity, transform;
  transform-origin: center right;
}

:root.crm-page-animating .panel-card,
:root.crm-page-animating .content-card,
:root.crm-page-animating .customer-card,
:root.crm-page-animating .contact-card,
:root.crm-page-animating .business-card,
:root.crm-page-animating .contract-card,
:root.crm-page-animating .receivables-card,
:root.crm-page-animating .detail-card,
:root.crm-page-animating .record-card,
:root.crm-page-animating .summary-card,
:root.crm-page-animating .form-card,
:root.crm-page-animating .project-card,
:root.crm-page-animating .task-card,
:root.crm-page-animating .data-card,
:root.crm-page-animating .todo-card,
:root.crm-page-animating .app-section,
:root.crm-page-animating .apps-section,
:root.crm-page-animating .theme-card,
:root.crm-page-animating .config-item {
  animation: crm-card-rise 520ms var(--crm-page-motion-ease) 80ms both;
  will-change: opacity, transform;
}

@keyframes crm-page-slide-in {
  from {
    opacity: 0.35;
    transform: translate3d(96rpx, 0, 0) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes crm-card-rise {
  from {
    opacity: 0;
    transform: translate3d(0, 36rpx, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  :root.crm-page-animating uni-page-body > *:first-child,
  :root.crm-page-animating .uni-page-body > *:first-child,
  :root.crm-page-animating .crm-motion-target,
  :root.crm-page-animating .panel-card,
  :root.crm-page-animating .content-card,
  :root.crm-page-animating .customer-card,
  :root.crm-page-animating .contact-card,
  :root.crm-page-animating .business-card,
  :root.crm-page-animating .contract-card,
  :root.crm-page-animating .receivables-card,
  :root.crm-page-animating .detail-card,
  :root.crm-page-animating .record-card,
  :root.crm-page-animating .summary-card,
  :root.crm-page-animating .form-card,
  :root.crm-page-animating .project-card,
  :root.crm-page-animating .task-card,
  :root.crm-page-animating .data-card,
  :root.crm-page-animating .todo-card,
  :root.crm-page-animating .app-section,
  :root.crm-page-animating .apps-section,
  :root.crm-page-animating .theme-card,
  :root.crm-page-animating .config-item {
    animation: none !important;
  }
}

view,
text,
button,
input,
textarea {
  box-sizing: border-box;
}

.page-shell {
  min-height: 100vh;
  padding-bottom: calc(112rpx + env(safe-area-inset-bottom));
}

.panel-card {
  background: var(--crm-card-bg);
  border-radius: 28rpx;
  box-shadow: 0 18rpx 40rpx rgba(40, 87, 164, 0.08);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24rpx;
}

.section-title__text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--crm-text);
}

.muted-text {
  color: var(--crm-text-muted);
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  height: 42rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 22rpx;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 84rpx;
  border-radius: 22rpx;
  background: linear-gradient(135deg, var(--crm-primary) 0%, var(--crm-primary-2) 100%);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 80rpx;
  border-radius: 22rpx;
  background: var(--crm-soft-bg);
  color: var(--crm-primary);
  font-size: 28rpx;
  border: none;
}

:root[data-crm-dark="1"] page,
:root[data-crm-dark="1"] body {
  background: var(--crm-page-bg) !important;
  color: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .panel-card,
:root[data-crm-dark="1"] .content-card,
:root[data-crm-dark="1"] .customer-card,
:root[data-crm-dark="1"] .contact-card,
:root[data-crm-dark="1"] .business-card,
:root[data-crm-dark="1"] .contract-card,
:root[data-crm-dark="1"] .receivables-card,
:root[data-crm-dark="1"] .detail-card,
:root[data-crm-dark="1"] .record-card,
:root[data-crm-dark="1"] .todo-card,
:root[data-crm-dark="1"] .todo-item,
:root[data-crm-dark="1"] .summary-card,
:root[data-crm-dark="1"] .todo-record,
:root[data-crm-dark="1"] .relation-section,
:root[data-crm-dark="1"] .config-item,
:root[data-crm-dark="1"] .theme-card,
:root[data-crm-dark="1"] .app-section,
:root[data-crm-dark="1"] .apps-section,
:root[data-crm-dark="1"] .home-apps,
:root[data-crm-dark="1"] .report-card,
:root[data-crm-dark="1"] .target-card,
:root[data-crm-dark="1"] .forgotten-card,
:root[data-crm-dark="1"] .section-card,
:root[data-crm-dark="1"] .form-card,
:root[data-crm-dark="1"] .input-panel,
:root[data-crm-dark="1"] .record-form,
:root[data-crm-dark="1"] .filter-sheet,
:root[data-crm-dark="1"] .stat-card,
:root[data-crm-dark="1"] .project-card,
:root[data-crm-dark="1"] .task-card,
:root[data-crm-dark="1"] .list-card {
  background: var(--crm-card-bg) !important;
  box-shadow: 0 18rpx 44rpx rgba(0, 0, 0, 0.28) !important;
}

:root[data-crm-dark="1"] .tabbar,
:root[data-crm-dark="1"] .bottom-bar,
:root[data-crm-dark="1"] .float-actions,
:root[data-crm-dark="1"] .approval-bar {
  background: rgba(21, 31, 47, 0.96) !important;
  border-color: var(--crm-border) !important;
}

:root[data-crm-dark="1"] .uni-page-head,
:root[data-crm-dark="1"] .uni-page-head-hd,
:root[data-crm-dark="1"] .uni-page-head-bd {
  background: var(--crm-page-bg) !important;
  border-color: var(--crm-border) !important;
  color: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .uni-page-head__title,
:root[data-crm-dark="1"] .uni-page-head .uni-btn-icon,
:root[data-crm-dark="1"] .uni-page-head .uni-page-head-btn {
  color: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .uni-page-head-hd,
:root[data-crm-dark="1"] .uni-page-head-hd *,
:root[data-crm-dark="1"] .uni-page-head-btn,
:root[data-crm-dark="1"] .uni-page-head-btn *,
:root[data-crm-dark="1"] .uni-btn-icon,
:root[data-crm-dark="1"] .uni-btn-icon * {
  color: var(--crm-text) !important;
  border-color: var(--crm-text) !important;
  stroke: var(--crm-text) !important;
  fill: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .uni-page-head-hd::before,
:root[data-crm-dark="1"] .uni-page-head-hd::after,
:root[data-crm-dark="1"] .uni-page-head-btn::before,
:root[data-crm-dark="1"] .uni-page-head-btn::after,
:root[data-crm-dark="1"] .uni-btn-icon::before,
:root[data-crm-dark="1"] .uni-btn-icon::after {
  color: var(--crm-text) !important;
  border-color: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .head-actions,
:root[data-crm-dark="1"] .filter-chip,
:root[data-crm-dark="1"] .search-box,
:root[data-crm-dark="1"] .category-input,
:root[data-crm-dark="1"] input,
:root[data-crm-dark="1"] textarea {
  background: var(--crm-input-bg) !important;
  border-color: var(--crm-border) !important;
  color: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .section-title__text,
:root[data-crm-dark="1"] .card-title,
:root[data-crm-dark="1"] .apps-title,
:root[data-crm-dark="1"] .section-name,
:root[data-crm-dark="1"] .customer-name,
:root[data-crm-dark="1"] .customer-card__name,
:root[data-crm-dark="1"] .contact-name,
:root[data-crm-dark="1"] .business-name,
:root[data-crm-dark="1"] .business-card__name,
:root[data-crm-dark="1"] .contract-name,
:root[data-crm-dark="1"] .field-value,
:root[data-crm-dark="1"] .record-user,
:root[data-crm-dark="1"] .record-content,
:root[data-crm-dark="1"] .relation-row-name,
:root[data-crm-dark="1"] .main-tab,
:root[data-crm-dark="1"] .filter-text,
:root[data-crm-dark="1"] .range-row,
:root[data-crm-dark="1"] .summary-title,
:root[data-crm-dark="1"] .record-title,
:root[data-crm-dark="1"] .report-item__value,
:root[data-crm-dark="1"] .target-percent,
:root[data-crm-dark="1"] .target-summary__value,
:root[data-crm-dark="1"] .forgotten-item__value,
:root[data-crm-dark="1"] .amount-num,
:root[data-crm-dark="1"] .theme-name,
:root[data-crm-dark="1"] .config-text,
:root[data-crm-dark="1"] .app-item__text,
:root[data-crm-dark="1"] .apps-text {
  color: var(--crm-text) !important;
}

:root[data-crm-dark="1"] .muted-text,
:root[data-crm-dark="1"] .meta-line,
:root[data-crm-dark="1"] .owner-line,
:root[data-crm-dark="1"] .field-label,
:root[data-crm-dark="1"] .record-time,
:root[data-crm-dark="1"] .record-line,
:root[data-crm-dark="1"] .relation-row-line,
:root[data-crm-dark="1"] .empty-text,
:root[data-crm-dark="1"] .theme-desc,
:root[data-crm-dark="1"] .section-title__tip,
:root[data-crm-dark="1"] .filter-label,
:root[data-crm-dark="1"] .todo-desc,
:root[data-crm-dark="1"] .todo-arrow,
:root[data-crm-dark="1"] .summary-sub,
:root[data-crm-dark="1"] .record-desc,
:root[data-crm-dark="1"] .record-time,
:root[data-crm-dark="1"] .bottom-text,
:root[data-crm-dark="1"] .report-item__label,
:root[data-crm-dark="1"] .target-label,
:root[data-crm-dark="1"] .target-summary__item,
:root[data-crm-dark="1"] .customer-card__line,
:root[data-crm-dark="1"] .business-card__line,
:root[data-crm-dark="1"] .business-card__foot,
:root[data-crm-dark="1"] .filter-item,
:root[data-crm-dark="1"] .amount-label,
:root[data-crm-dark="1"] .list-tools__item,
:root[data-crm-dark="1"] .tabbar__item {
  color: var(--crm-text-muted) !important;
}

:root[data-crm-dark="1"] .is-active,
:root[data-crm-dark="1"] .main-tab.active,
:root[data-crm-dark="1"] .sub-tab.active,
:root[data-crm-dark="1"] .filter-tab.is-active,
:root[data-crm-dark="1"] .range-row.is-current,
:root[data-crm-dark="1"] .relation-create {
  color: var(--crm-primary) !important;
}

:root[data-crm-dark="1"] .sub-tab.active {
  color: #ffffff !important;
}

:root[data-crm-dark="1"] .field-row,
:root[data-crm-dark="1"] .relation-row,
:root[data-crm-dark="1"] .main-tabs,
:root[data-crm-dark="1"] .record-actions,
:root[data-crm-dark="1"] .todo-content,
:root[data-crm-dark="1"] .form-row,
:root[data-crm-dark="1"] .report-grid,
:root[data-crm-dark="1"] .report-item,
:root[data-crm-dark="1"] .forgotten-grid,
:root[data-crm-dark="1"] .forgotten-item,
:root[data-crm-dark="1"] .tabbar {
  border-color: var(--crm-border) !important;
}

:root[data-crm-dark="1"] .time-option,
:root[data-crm-dark="1"] .target-summary,
:root[data-crm-dark="1"] .relation-empty,
:root[data-crm-dark="1"] .empty-panel,
:root[data-crm-dark="1"] .record-body,
:root[data-crm-dark="1"] .time-row {
  background: var(--crm-elevated-bg) !important;
}

:root[data-crm-dark="1"] .theme-head,
:root[data-crm-dark="1"] .customer-detail-page,
:root[data-crm-dark="1"] .contacts-detail-page,
:root[data-crm-dark="1"] .business-detail-page,
:root[data-crm-dark="1"] .contract-detail-page,
:root[data-crm-dark="1"] .leads-detail-page,
:root[data-crm-dark="1"] .receivables-detail-page {
  background: linear-gradient(180deg, var(--crm-hero-start) 0, var(--crm-soft-bg) 170rpx, var(--crm-page-bg) 100%) !important;
}
</style>
