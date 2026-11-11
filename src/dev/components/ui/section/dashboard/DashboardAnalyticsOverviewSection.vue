<template>
  <!-- overview/insight section -->
  <DashboardSectionWrapper>
    <div class="min-w-0 max-w-full">
      <!-- section-header -->
      <div
        class="flex flex-col items-start justify-between sm:flex-row sm:items-center px-2 md:px-4 p-4 md:pb-6"
      >
        <!-- title -->
        <div
          class="flex items-center gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
        >
          <span>
            <img
              :src="analyticsOverviewIconUrl || ''"
              alt="overview/insight"
              class="w-6 h-6"
            />
          </span>
          <h2
            class="m-0 font-medium text-xl font-sans leading-[1.875rem] text-light-text-quaternary dark:text-dark-text-quaternary"
            data-testid="dashboard-analytics-overview-heading"
          >
            {{ $t("dashboard.analytics.page.overviewTitle") }}
          </h2>
        </div>
        <!-- last-date -->
        <div
          class="flex items-center gap-4 w-full justify-between sm:justify-end sm:w-auto"
        >
          <span
            class="text-sm font-sans font-[400] leading-5 text-light-text-quaternary dark:text-dark-text-quaternary"
            >{{ $t("dashboard.analytics.page.lastUpdated") }}
            <span
              :data-value="lastUpdated"
              class="text-sm font-sans leading-5 font-[400] text-light-text-quaternary dark:text-dark-text-quaternary"
              >{{ formatAnalyticsLastUpdatedAt(lastUpdated) }}</span
            ></span
          >
          <DashboardPrimaryButton
            theme="analyticsRefresh"
            @click="$emit('refresh')"
            data-testid="dashboard-analytics-refresh-button"
            :disabled="isAnalyticsRefreshing"
            :text="
              isAnalyticsRefreshing
                ? $t('dashboard.analytics.page.refreshing')
                : $t('dashboard.analytics.page.refresh')
            "
            :leftIcon="analyticsRefreshIconUrl || ''"
            :leftIconClass="`w-[.875rem] h-[.875rem] transition-all group-hover:brightness-0 group-hover:invert ${isAnalyticsRefreshing ? 'animate-spin' : ''}`"
            :wrapperOverrides="[
              { target: 'wrapper1', removeClass: true },
              { target: 'wrapper2', removeClass: true },
            ]"
          />
        </div>
      </div>

      <!-- row -->
      <DashboardAnalyticsSnapCarousel
        :slides="3"
        height-mode="active"
        track-class="pt-0 lg:pb-4 md:px-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <!-- left-column: one mobile slide; one desktop grid column -->
        <div class="w-full min-w-0 max-w-full shrink-0 grow-0 basis-full snap-start self-start flex flex-col gap-4 md:w-auto md:max-w-none md:basis-auto self-stretch">
          <!-- subscribers -->
          <DashboardAnalyticsMetricCard
            :title="$t('dashboard.analytics.trends.subscribers')"
            data-analytics-card="subscribers"
            :loading="isAnalyticsRefreshing"
            @openTrend="$emit('openSubscribersTrendPopup')"
          >
            <!-- data-content (new) -->
            <div class="flex flex-row gap-4 sm:flex-col">
              <div
                class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0"
              >
                <div
                  class="flex items-start gap-3 md:gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
                >
                  <div
                    class="flex flex-col gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
                  >
                    <div class="relative">
                      <span
                        class="text-xs font-sans font-medium leading-[1.125rem] text-light-text-tertiary dark:text-dark-text-tertiary uppercase"
                        >{{
                          $t("dashboard.analytics.overview.new")
                        }}</span
                      >
                    </div>
  
                    <div class="flex justify-between items-end">
                      <span>
                        <span
                          :data-value="
                            dashboardAnalyticsStore.subscriberInsights?.daily?.new
                          "
                          class="text-[2.25rem] font-sans font-semibold leading-[2.75rem] tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary"
                          >{{
                            displayValue(
                              dashboardAnalyticsStore.subscriberInsights?.daily
                                ?.new,
                            )
                          }}</span
                        >
                      </span>
  
                      <!-- right part only show when data are here -->
                      <DashboardStatIndicator
                        v-if="
                            dashboardAnalyticsStore.subscriberInsights?.daily?.newPercentage !== undefined &&
                            dashboardAnalyticsStore.subscriberInsights?.daily?.newPercentage !== null &&
                            Math.abs(Number(dashboardAnalyticsStore.subscriberInsights?.daily?.newPercentage)) !== 0
                        "
                        :percentage="
                          dashboardAnalyticsStore.subscriberInsights?.daily
                            ?.newPercentage
                        "
                        :period-label="
                          $t('dashboard.analytics.trends.vsYesterday')
                        "
                      />
                    </div>
                    <div
                      class="w-full"
                      v-if="
                        dashboardAnalyticsStore.subscriberInsights?.daily?.new >
                          0 &&
                        dashboardAnalyticsStore.subscriberInsights?.daily
                          ?.newSparkline?.length > 0
                      "
                    >
                      <SparkLine
                        :data="
                          dashboardAnalyticsStore.subscriberInsights.daily
                            .newSparkline
                        "
                        :color="
                          isSparklineIncreasing(
                            dashboardAnalyticsStore.subscriberInsights.daily
                              .newSparkline,
                          )
                            ? '#22c55e'
                            : '#ef4444'
                        "
                        :height="28"
                      />
                    </div>
                  </div>
                </div>
              </div>
  
              <div
                class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0"
              >
                <div
                  class="flex items-start gap-3 md:gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
                >
                  <div
                    class="flex flex-col gap-2 flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
                  >
                    <div class="relative">
                      <span
                        class="text-xs font-sans font-medium leading-[1.125rem] text-light-text-tertiary dark:text-dark-text-tertiary"
                        >{{
                          $t("dashboard.analytics.overview.recurring")
                        }}</span
                      >
                    </div>
  
                    <div class="flex justify-between items-end">
                      <span>
                        <span
                          :data-value="
                            dashboardAnalyticsStore.subscriberInsights?.daily
                              ?.recurring
                          "
                          class="text-[2.25rem] font-sans font-semibold leading-[2.75rem] tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary"
                          >{{
                            displayValue(
                              dashboardAnalyticsStore.subscriberInsights?.daily
                                ?.recurring,
                            )
                          }}</span
                        >
                      </span>
                      <!-- right part only show when data are here -->
                      <DashboardStatIndicator
                        v-if="
                          dashboardAnalyticsStore.subscriberInsights?.daily
                            ?.recurringPercentage !== undefined &&
                          dashboardAnalyticsStore.subscriberInsights?.daily
                            ?.recurringPercentage !== null &&
                          Math.abs(Number(dashboardAnalyticsStore.subscriberInsights?.daily?.recurringPercentage)) !== 0
                        "
                        :percentage="
                          dashboardAnalyticsStore.subscriberInsights?.daily
                            ?.recurringPercentage
                        "
                        :period-label="
                          $t('dashboard.analytics.trends.vsYesterday')
                        "
                      />
                    </div>
                    <div
                      class="w-full"
                      v-if="
                        dashboardAnalyticsStore.subscriberInsights?.daily
                          ?.recurring > 0 &&
                        dashboardAnalyticsStore.subscriberInsights?.daily
                          ?.recurringSparkline?.length > 0
                      "
                    >
                      <SparkLine
                        :data="
                          dashboardAnalyticsStore.subscriberInsights.daily
                            .recurringSparkline
                        "
                        :color="
                          isSparklineIncreasing(
                            dashboardAnalyticsStore.subscriberInsights.daily
                              .recurringSparkline,
                          )
                            ? '#22c55e'
                            : '#ef4444'
                        "
                        :width="70"
                        :height="28"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DashboardAnalyticsMetricCard>

          <!-- earnings-->
          <DashboardAnalyticsMetricCard
            :title="$t('dashboard.analytics.trends.earnings')"
            data-analytics-card="earnings"
            :loading="isAnalyticsRefreshing"
            @openTrend="$emit('openEarningsTrendPopup')"
          >
            <div class="flex justify-between items-end">
              <span > 
                <span
                  :data-value="
                    dashboardAnalyticsStore.earningsInsights?.daily?.total
                  "
                  class="text-[2.25rem] font-semibold leading-[2.75rem] font-sans tracking-[-0.045rem] text-light-text-primary dark:text-dark-text-primary"
                  >{{
                    displayCurrency(
                      dashboardAnalyticsStore.earningsInsights?.daily?.total,
                    )
                  }}</span
                >
                <span
                  v-if="Number(dashboardAnalyticsStore.earningsInsights?.daily?.total || 0) > 0"
                  class="text-base font-medium leading-6 font-sans text-light-text-secondary dark:text-dark-text-secondary ml-1"
                >
                  USD
                </span>
              </span>
            <div
            v-if="
            dashboardAnalyticsStore.earningsInsights?.daily?.percentage !== undefined &&
            dashboardAnalyticsStore.earningsInsights?.daily?.percentage !== null &&
            Number.isFinite(
            Number(dashboardAnalyticsStore.earningsInsights?.daily?.percentage),
            ) &&
            (
            Number(dashboardAnalyticsStore.earningsInsights?.daily?.percentage) !== 0 ||
            Number(dashboardAnalyticsStore.earningsInsights?.daily?.total) > 0
            )
            "
            class="flex flex-col items-end gap-1"
            >
                <div>
                  <span class="flex gap-1 items-center">
                    <img
                      :src="
                        isSparklineIncreasing(
                          dashboardAnalyticsStore.earningsInsights?.daily
                            ?.sparklineData,
                        )
                          ? analyticsTrendUpUrl || ''
                          : analyticsTrendDownUrl || ''
                      "
                      :alt="
                        isSparklineIncreasing(
                          dashboardAnalyticsStore.earningsInsights?.daily
                            ?.sparklineData,
                        )
                          ? 'trend-up'
                          : 'trend-down'
                      "
                      class="h-5 w-5"
                    />
                    <span
                      :class="
                        isSparklineIncreasing(
                          dashboardAnalyticsStore.earningsInsights?.daily
                            ?.sparklineData,
                        )
                          ? 'text-light-text-trendGreen'
                          : 'text-light-text-trendRed'
                      "
                      class="leading-5 text-sm font-medium"
                      >{{
                        Math.abs(
                          dashboardAnalyticsStore.earningsInsights.daily
                            .percentage,
                        )
                      }}%</span
                    >
                  </span>
                  <span
                    class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                  >
                    {{ $t("dashboard.analytics.trends.vsYesterday") }}
                  </span>
                </div>
              </div>
            </div>
            <div
              class="w-full mt-auto"
              v-if="
                dashboardAnalyticsStore.earningsInsights?.daily?.total > 0 &&
                dashboardAnalyticsStore.earningsInsights?.daily?.sparklineData
                  ?.length > 0
              "
            >
              <SparkLine
                :data="
                  dashboardAnalyticsStore.earningsInsights.daily.sparklineData
                "
                :color="
                  isSparklineIncreasing(
                    dashboardAnalyticsStore.earningsInsights.daily
                      .sparklineData,
                  )
                    ? '#22c55e'
                    : '#ef4444'
                "
                :height="28"
              />
            </div>
          </DashboardAnalyticsMetricCard>
        </div>

        <!-- middle-column: one mobile slide; one desktop grid column -->
        <div class="w-full min-w-0 max-w-full shrink-0 grow-0 basis-full snap-start self-start flex flex-col gap-4 md:w-auto md:max-w-none md:basis-auto self-stretch">
          <!-- fans-->
          <DashboardAnalyticsMetricCard
            :title="$t('dashboard.analytics.trends.fans')"
            data-analytics-card="fans"
            :loading="isAnalyticsRefreshing"
            @openTrend="$emit('openFansTrendPopup')"
          >
            <!-- data-content (new followers - profile visit) -->
            <div
              class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0"
            >
              <div
                class="flex items-start gap-3 md:gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
              >
                <div class="flex flex-col gap-2 flex-1 min-w-0 items-start">
                  <span
                    class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap truncate max-w-full text-light-text-tertiary dark:text-dark-text-tertiary"
                    >{{
                      $t("dashboard.analytics.overview.newFollowers")
                    }}</span
                  >

                  <div class="flex items-end justify-between w-full gap-1">
                    <span
                      :data-value="
                        dashboardAnalyticsStore.fans?.daily?.newFollowers
                      "
                      class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary"
                    >
                      {{
                        dashboardAnalyticsStore.fans?.daily?.newFollowers === 0
                          ? 0
                          : displayValue(
                              dashboardAnalyticsStore.fans?.daily?.newFollowers,
                            )
                      }}</span
                    >
                    <div
                      v-if="
                        dashboardAnalyticsStore.fans?.daily
                          ?.newFollowersPercentage !== undefined &&
                        dashboardAnalyticsStore.fans?.daily
                          ?.newFollowersPercentage !== null &&
                        Math.abs(Number(dashboardAnalyticsStore.fans?.daily?.newFollowersPercentage)) !== 0
                      "
                      class="flex flex-col items-end gap-1"
                    >
                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.newFollowersSparkline,
                              )
                                ? analyticsTrendUpUrl || ''
                                : analyticsTrendDownUrl || ''
                            "
                            :alt="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.newFollowersSparkline,
                              )
                                ? 'trend-up'
                                : 'trend-down'
                            "
                            class="h-5 w-5"
                          />
                          <span
                            :class="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.newFollowersSparkline,
                              )
                                ? 'text-light-text-trendGreen dark:text-light-text-trendGreen'
                                : 'text-light-text-trendRed dark:text-light-text-trendRed'
                            "
                            class="leading-5 text-sm font-medium"
                          >
                            {{
                              Math.abs(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.newFollowersPercentage,
                              )
                            }}%
                          </span>
                        </span>

                        <span
                          class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                        >
                          {{ $t("dashboard.analytics.trends.vsYesterday") }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-full"
                    v-if="
                      dashboardAnalyticsStore.fans?.daily?.newFollowers > 0 &&
                      dashboardAnalyticsStore.fans?.daily?.newFollowersSparkline
                        ?.length > 0
                    "
                  >
                    <SparkLine
                      :data="
                        dashboardAnalyticsStore.fans.daily.newFollowersSparkline
                      "
                      :color="
                        dashboardAnalyticsStore.fans.daily
                          .newFollowersSparkline[
                          dashboardAnalyticsStore.fans.daily
                            .newFollowersSparkline.length - 1
                        ] >=
                        dashboardAnalyticsStore.fans.daily
                          .newFollowersSparkline[
                          dashboardAnalyticsStore.fans.daily
                            .newFollowersSparkline.length - 2
                        ]
                          ? '#22c55e'
                          : '#ef4444'
                      "
                      :width="60"
                      :height="24"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-2 flex-1 min-w-0 items-start">
                  <span
                    class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap truncate max-w-full text-light-text-tertiary dark:text-dark-text-tertiary"
                    >{{
                      $t("dashboard.analytics.overview.profileVisit")
                    }}</span
                  >

                  <div class="flex items-end justify-between w-full gap-1">
                   
                   
                    <span
  :data-value="
    dashboardAnalyticsStore.fans?.daily?.profileVisit
  "
  class="text-[1.875rem] font-semibold font-sans leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary"
>
  {{
    displayValue(
      dashboardAnalyticsStore.fans?.daily?.profileVisit,
    )
  }}</span
>


<div
  v-if="
    dashboardAnalyticsStore.fans?.daily
      ?.profileVisitPercentage !== undefined &&
    dashboardAnalyticsStore.fans?.daily
      ?.profileVisitPercentage !== null &&
    Math.abs(Number(dashboardAnalyticsStore.fans?.daily?.profileVisitPercentage)) !== 0
  "
  class="flex flex-col items-end gap-1"
>
                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.profileVisitSparkline,
                              )
                                ? analyticsTrendUpUrl || ''
                                : analyticsTrendDownUrl || ''
                            "
                            :alt="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.profileVisitSparkline,
                              )
                                ? 'trend-up'
                                : 'trend-down'
                            "
                            class="h-5 w-5"
                          />
                          <span
                            :class="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.profileVisitSparkline,
                              )
                                ? 'text-light-text-trendGreen dark:text-light-text-trendGreen'
                                : 'text-light-text-trendRed dark:text-light-text-trendRed'
                            "
                            class="leading-5 text-sm font-medium"
                          >
                            {{
                              Math.abs(
                                dashboardAnalyticsStore.fans?.daily
                                  ?.profileVisitPercentage,
                              )
                            }}%
                          </span>
                        </span>

                        <span
                          class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                        >
                          {{ $t("dashboard.analytics.trends.vsYesterday") }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-full"
                    v-if="
                      dashboardAnalyticsStore.fans?.daily?.profileVisit > 0 &&
                      dashboardAnalyticsStore.fans?.daily?.profileVisitSparkline
                        ?.length > 0
                    "
                  >
                    <SparkLine
                      :data="
                        dashboardAnalyticsStore.fans.daily.profileVisitSparkline
                      "
                      :color="
                        dashboardAnalyticsStore.fans.daily
                          .profileVisitSparkline[
                          dashboardAnalyticsStore.fans.daily
                            .profileVisitSparkline.length - 1
                        ] >=
                        dashboardAnalyticsStore.fans.daily
                          .profileVisitSparkline[
                          dashboardAnalyticsStore.fans.daily
                            .profileVisitSparkline.length - 2
                        ]
                          ? '#22c55e'
                          : '#ef4444'
                      "
                      :width="60"
                      :height="24"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DashboardAnalyticsMetricCard>

          <!-- likes -->
          <!-- likes -->
          <DashboardAnalyticsMetricCard
            :title="$t('dashboard.analytics.trends.likes')"
            data-analytics-card="likes"
            :loading="isAnalyticsRefreshing"
            :hasTrend="false"
          >
            <!-- data-content (media-merch) -->
            <div
              class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0"
            >
              <div
                class="flex items-start gap-3 md:gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
              >
                <div class="flex flex-col gap-2 flex-1 min-w-0 items-start">
                  <span
                    class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap truncate max-w-full text-light-text-tertiary dark:text-dark-text-tertiary"
                    >{{
                      $t("dashboard.analytics.overview.media")
                    }}</span
                  >

                  <div class="flex items-end justify-between w-full gap-1">
                    <span
                      :data-value="dashboardAnalyticsStore.likes?.media"
                      class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary"
                    >
                      {{
                        displayCurrency(dashboardAnalyticsStore.likes?.media)
                      }}</span
                    >
                    <div
                      v-if="
                        dashboardAnalyticsStore.likes?.mediaPercentage !==
                          undefined &&
                        dashboardAnalyticsStore.likes?.mediaPercentage !== null &&
                        Math.abs(Number(dashboardAnalyticsStore.likes?.mediaPercentage)) !== 0
                      "
                      class="flex flex-col items-end gap-1"
                    >
                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.mediaSparkline,
                              )
                                ? analyticsTrendUpUrl || ''
                                : analyticsTrendDownUrl || ''
                            "
                            :alt="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.mediaSparkline,
                              )
                                ? 'trend-up'
                                : 'trend-down'
                            "
                            class="h-5 w-5"
                          />
                          <span
                            :class="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.mediaSparkline,
                              )
                                ? 'text-light-text-trendGreen dark:text-light-text-trendGreen'
                                : 'text-light-text-trendRed dark:text-light-text-trendRed'
                            "
                            class="leading-5 text-sm font-medium"
                            >{{
                              Math.abs(
                                dashboardAnalyticsStore.likes?.mediaPercentage,
                              )
                            }}%</span
                          >
                        </span>
                        <span
                          class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                          >{{
                            $t("dashboard.analytics.trends.vsYesterday")
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-full"
                    v-if="
                      dashboardAnalyticsStore.likes?.media > 0 &&
                      dashboardAnalyticsStore.likes?.mediaSparkline?.length > 0
                    "
                  >
                    <SparkLine
                      :data="dashboardAnalyticsStore.likes.mediaSparkline"
                      :color="
                        dashboardAnalyticsStore.likes.mediaSparkline[
                          dashboardAnalyticsStore.likes.mediaSparkline.length -
                            1
                        ] >=
                        dashboardAnalyticsStore.likes.mediaSparkline[
                          dashboardAnalyticsStore.likes.mediaSparkline.length -
                            2
                        ]
                          ? '#22c55e'
                          : '#ef4444'
                      "
                      :width="55"
                      :height="22"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-2 flex-1 min-w-0 items-start">
                  <span
                    class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap truncate max-w-full text-light-text-tertiary dark:text-dark-text-tertiary"
                    >{{
                      $t("dashboard.analytics.overview.merch")
                    }}</span
                  >

                  <div class="flex items-end justify-between w-full gap-1">
                    <span
                      :data-value="dashboardAnalyticsStore.likes?.merch"
                      class="text-[1.875rem] font-sans font-semibold leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary"
                      >{{
                        displayValue(dashboardAnalyticsStore.likes?.merch)
                      }}</span
                    >
                    <div
                      v-if="
                        dashboardAnalyticsStore.likes?.merchPercentage !==
                          undefined &&
                        dashboardAnalyticsStore.likes?.merchPercentage !== null &&
                        Math.abs(Number(dashboardAnalyticsStore.likes?.merchPercentage)) !== 0
                      "
                      class="flex flex-col items-end gap-1"
                    >
                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.merchSparkline,
                              )
                                ? analyticsTrendUpUrl || ''
                                : analyticsTrendDownUrl || ''
                            "
                            :alt="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.merchSparkline,
                              )
                                ? 'trend-up'
                                : 'trend-down'
                            "
                            class="h-5 w-5"
                          />
                          <span
                            :class="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.merchSparkline,
                              )
                                ? 'text-light-text-trendGreen dark:text-light-text-trendGreen'
                                : 'text-light-text-trendRed dark:text-light-text-trendRed'
                            "
                            class="leading-5 text-sm font-medium"
                            >{{
                              Math.abs(
                                dashboardAnalyticsStore.likes?.merchPercentage,
                              )
                            }}%</span
                          >
                        </span>
                        <span
                          class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                          >{{
                            $t("dashboard.analytics.trends.vsYesterday")
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-full"
                    v-if="
                      dashboardAnalyticsStore.likes?.merch > 0 &&
                      dashboardAnalyticsStore.likes?.merchSparkline?.length > 0
                    "
                  >
                    <SparkLine
                      :data="dashboardAnalyticsStore.likes.merchSparkline"
                      :color="
                        dashboardAnalyticsStore.likes.merchSparkline[
                          dashboardAnalyticsStore.likes.merchSparkline.length -
                            1
                        ] >=
                        dashboardAnalyticsStore.likes.merchSparkline[
                          dashboardAnalyticsStore.likes.merchSparkline.length -
                            2
                        ]
                          ? '#22c55e'
                          : '#ef4444'
                      "
                      :width="55"
                      :height="22"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- data-content (profile-feed) -->
            <div
              class="flex flex-col flex-grow flex-shrink [flex-basis: auto] justify-center items-start gap-4 min-w-0 min-h-0"
            >
              <div
                class="flex items-start gap-3 md:gap-6 w-full flex-grow flex-shrink [flex-basis: auto] min-w-0 min-h-0"
              >
                <div class="flex flex-col gap-2 flex-1 min-w-0 items-start">
                  <span
                    class="text-xs font-medium font-sans leading-[1.125rem] whitespace-nowrap truncate max-w-full text-light-text-tertiary dark:text-dark-text-tertiary"
                    >{{
                      $t("dashboard.analytics.overview.profile")
                    }}</span
                  >

                  <div class="flex items-end justify-between w-full gap-1">
                    <span
                      :data-value="dashboardAnalyticsStore.likes?.profile"
                      class="text-[1.875rem] font-semibold font-sans leading-[2.375rem] text-light-text-primary dark:text-dark-text-primary"
                      >{{
                        displayCurrency(dashboardAnalyticsStore.likes?.profile)
                      }}</span
                    >
                    <div
                      v-if="
                        dashboardAnalyticsStore.likes?.profilePercentage !==
                          undefined &&
                        dashboardAnalyticsStore.likes?.profilePercentage !==
                          null &&
                        Math.abs(Number(dashboardAnalyticsStore.likes?.profilePercentage)) !== 0
                      "
                      class="flex flex-col items-end gap-1"
                    >
                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.profileSparkline,
                              )
                                ? analyticsTrendUpUrl || ''
                                : analyticsTrendDownUrl || ''
                            "
                            :alt="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.profileSparkline,
                              )
                                ? 'trend-up'
                                : 'trend-down'
                            "
                            class="h-5 w-5"
                          />
                          <span
                            :class="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.profileSparkline,
                              )
                                ? 'text-light-text-trendGreen dark:text-light-text-trendGreen'
                                : 'text-light-text-trendRed dark:text-light-text-trendRed'
                            "
                            >{{
                              Math.abs(
                                dashboardAnalyticsStore.likes
                                  ?.profilePercentage,
                              )
                            }}%</span
                          >
                        </span>
                        <span
                          class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                          >{{
                            $t("dashboard.analytics.trends.vsYesterday")
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-full"
                    v-if="
                      dashboardAnalyticsStore.likes?.profile > 0 &&
                      dashboardAnalyticsStore.likes?.profileSparkline?.length >
                        0
                    "
                  >
                    <SparkLine
                      :data="dashboardAnalyticsStore.likes.profileSparkline"
                      :color="
                        dashboardAnalyticsStore.likes.profileSparkline[
                          dashboardAnalyticsStore.likes.profileSparkline
                            .length - 1
                        ] >=
                        dashboardAnalyticsStore.likes.profileSparkline[
                          dashboardAnalyticsStore.likes.profileSparkline
                            .length - 2
                        ]
                          ? '#22c55e'
                          : '#ef4444'
                      "
                      :width="55"
                      :height="22"
                    />
                  </div>
                </div>

                <div class="flex flex-col gap-2 flex-1 min-w-0 items-start">
                  <span
                    class="text-xs font-medium leading-[1.125rem] font-sans whitespace-nowrap truncate max-w-full text-light-text-tertiary dark:text-dark-text-tertiary"
                    >{{ $t("dashboard.analytics.overview.feed") }}</span
                  >

                  <div class="flex items-end justify-between w-full gap-1">
                    <span
                      :data-value="dashboardAnalyticsStore.likes?.feed"
                      class="text-[1.875rem] font-semibold leading-[2.375rem] font-sans text-light-text-primary dark:text-dark-text-primary"
                      >{{
                        displayCurrency(dashboardAnalyticsStore.likes?.feed)
                      }}</span
                    >
                    <div
                      v-if="
                        dashboardAnalyticsStore.likes?.feedPercentage !==
                          undefined &&
                        dashboardAnalyticsStore.likes?.feedPercentage !== null &&
                        Math.abs(Number(dashboardAnalyticsStore.likes?.feedPercentage)) !== 0
                      "
                      class="flex flex-col items-end gap-1"
                    >
                      <div>
                        <span class="flex gap-1 items-center">
                          <img
                            :src="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.feedSparkline,
                              )
                                ? analyticsTrendUpUrl || ''
                                : analyticsTrendDownUrl || ''
                            "
                            :alt="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.feedSparkline,
                              )
                                ? 'trend-up'
                                : 'trend-down'
                            "
                            class="h-5 w-5"
                          />
                          <span
                            :class="
                              isSparklineIncreasing(
                                dashboardAnalyticsStore.likes?.feedSparkline,
                              )
                                ? 'text-light-text-trendGreen dark:text-light-text-trendGreen'
                                : 'text-light-text-trendRed dark:text-light-text-trendRed'
                            "
                            class="leading-5 text-sm font-medium"
                            >{{
                              Math.abs(
                                dashboardAnalyticsStore.likes?.feedPercentage,
                              )
                            }}%</span
                          >
                        </span>
                        <span
                          class="text-[#101828] dark:text-dark-text-secondary leading-[1.125rem] text-xs"
                          >{{
                            $t("dashboard.analytics.trends.vsYesterday")
                          }}</span
                        >
                      </div>
                    </div>
                  </div>
                  <div
                    class="w-full"
                    v-if="
                      dashboardAnalyticsStore.likes?.feed > 0 &&
                      dashboardAnalyticsStore.likes?.feedSparkline?.length > 0
                    "
                  >
                    <SparkLine
                      :data="dashboardAnalyticsStore.likes.feedSparkline"
                      :color="
                        dashboardAnalyticsStore.likes.feedSparkline[
                          dashboardAnalyticsStore.likes.feedSparkline.length - 1
                        ] >=
                        dashboardAnalyticsStore.likes.feedSparkline[
                          dashboardAnalyticsStore.likes.feedSparkline.length - 2
                        ]
                          ? '#22c55e'
                          : '#ef4444'
                      "
                      :width="55"
                      :height="22"
                    />
                  </div>
                </div>
              </div>
            </div>
          </DashboardAnalyticsMetricCard>
        </div>

        <!-- right-column: one mobile slide; third desktop column on xl -->
        <div class="w-full min-w-0 max-w-full shrink-0 grow-0 basis-full snap-start self-start flex flex-col gap-4 col-span-full md:min-w-0 md:w-auto md:max-w-none md:basis-auto md:self-stretch xl:col-start-3">  <!-- top contributors -->
          <div
            class="group/container relative flex flex-col flex-grow flex-shrink [flex-basis:auto] gap-4 p-4 rounded-none min-w-0 min-h-0 [backdrop-filter:blur(25px)] bg-light-bg-container dark:bg-dark-bg-container transition-all duration-300 hover:shadow-[0px_0px_20px_0px_rgba(0,0,0,0.10)] hover:backdrop-blur-xl overflow-hidden gap-4"
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-4 min-w-0">
                <!-- hover-overlay -->
                <div
                  class="absolute hidden [@media(hover:hover)_and_(pointer:fine)]:md:group-hover/container:flex items-start justify-end w-full h-full top-0 left-0 z-[10000] pointer-events-none"
                >
                  <DashboardPrimaryButton
                    theme="analyticsTrend"
                    @click="$emit('openContributorsTrendPopup')"
                    :text="$t('dashboard.analytics.page.trend', 'Trend')"
                    :rightIcon="analyticsTrendExpandUrl || ''"
                    :wrapperOverrides="[
                      { target: 'wrapper1', removeClass: true },
                      { target: 'wrapper2', removeClass: true },
                    ]"
                  />
                </div>

                <!-- title -->
                <div class="flex items-center justify-between gap-2 min-w-0">
                  <h3
                    class="m-0 font-medium font-sans text-base leading-6 text-[#101828] dark:text-dark-text-secondary min-w-0"
                  >
                    {{ $t("dashboard.analytics.trends.topContributors") }}
                  </h3>
                  <div class="[@media(hover:hover)_and_(pointer:fine)]:hidden shrink-0">
                    <DashboardPrimaryButton
                      theme="analyticsTrend"
                      @click="$emit('openContributorsTrendPopup')"
                      customClass="active:bg-light-primary dark:hover:bg-dark-primaryHover dark:active:bg-dark-primaryHover"
                      textClass="text-xs font-sans font-medium leading-[1.125rem] text-light-primary dark:text-dark-primary group-hover/button:text-white group-active/button:text-white transition-colors"
                      :text="$t('dashboard.analytics.page.trend', 'Trend')"
                      :rightIcon="analyticsTrendExpandUrl || ''"
                      rightIconClass="w-[.875rem] h-[.875rem] transition-all group-hover/button:brightness-0 group-hover/button:invert group-active/button:brightness-0 group-active/button:invert"
                      :wrapperOverrides="[
                        { target: 'wrapper1', removeClass: true },
                        { target: 'wrapper2', removeClass: true },
                      ]"
                    />
                  </div>
                </div>
              </div>

              <!-- data-table -->
              <div
                class="flex-grow flex-shrink [flex-basis:auto] min-w-0 min-h-0 -mx-4 -mb-4"
              >
                <DashboardAnalyticsContributorsPreviewTable
                  :rows="filteredTopContributors"
                  :loading="showTableSkeletons"
                />
              </div>
            </div>
          </div>
        </div>
      </DashboardAnalyticsSnapCarousel>
    </div>
  </DashboardSectionWrapper>
</template>

<script setup>
import DashboardSectionWrapper from "@/components/ui/card/dashboard/DashboardSectionWrapper.vue";
import DashboardPrimaryButton from "@/components/ui/buttons/DashboardPrimaryButton.vue";
import DashboardAnalyticsMetricCard from "@/dev/components/ui/card/dashboard/DashboardAnalyticsMetricCard.vue";
import DashboardStatIndicator from "@/components/ui/badge/dashboard/DashboardStatIndicator.vue";
import DashboardAnalyticsContributorsPreviewTable from "@/dev/components/ui/table/dashboard/analytics-tables/DashboardAnalyticsContributorsPreviewTable.vue";
import DashboardAnalyticsSnapCarousel from "@/dev/components/ui/section/dashboard/DashboardAnalyticsSnapCarousel.vue";
import SparkLine from "@/components/ui/charts/SparkLine.vue";
import { useDashboardAnalyticsStore } from "@/stores/useDashboardAnalyticsStore.js";
import { useAssetUrl } from "@/composables/useAssetUrl.js";
import { useEnrichmentSkeleton } from "@/composables/useEnrichmentSkeleton.js";
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useI18n } from "vue-i18n";
import { filterZeroAmountEntries } from "@/utils/common/analyticsFilters.js";
import { useMobileMd } from "@/composables/useMobileMd.js";

const { t, n } = useI18n();

const props = defineProps({
  isAnalyticsRefreshing: {
    type: Boolean,
    default: false,
  },
  hideSkeletons: {
    type: Boolean,
    default: false,
  },
});

const { isEnrichmentPending } = useEnrichmentSkeleton();
const showTableSkeletons = computed(
  () =>
    isEnrichmentPending.value ||
    (!props.hideSkeletons && props.isAnalyticsRefreshing),
);

/** `--` only while refreshing; loaded empty state is 0 / 0 USD (not dashes). */
const displayValue = (val) => {
  if (props.isAnalyticsRefreshing) return "--";
  return val == null ? 0 : val;
};

const displayCurrency = (val) => {
  if (props.isAnalyticsRefreshing) return "--";
  return val == null ? 0 : n(Number(val));
};

const isSparklineIncreasing = (sparkline = []) => {
  if (!Array.isArray(sparkline) || sparkline.length < 2) {
    return true;
  }

  return sparkline[sparkline.length - 1] >= sparkline[sparkline.length - 2];
};

const contributorsPeriod = ref("alltime");
const dashboardAnalyticsStore = useDashboardAnalyticsStore();
const { isMobile } = useMobileMd();

const filteredTopContributors = computed(() => {
  return filterZeroAmountEntries(
    dashboardAnalyticsStore.getContributorsViewModel(contributorsPeriod.value).topContributors,
    "total"
  ).slice(0, isMobile.value ? 5 : 10);
});

const { lastUpdated } = storeToRefs(dashboardAnalyticsStore);

const { url: analyticsOverviewIconUrl } = useAssetUrl(
  "dashboard.analytics.overviewIcon",
);
const { url: analyticsRefreshIconUrl } = useAssetUrl(
  "dashboard.analytics.refreshIcon",
);
const { url: analyticsTrendExpandUrl } = useAssetUrl(
  "dashboard.analytics.trendExpand",
);
const { url: analyticsTrendUpUrl } = useAssetUrl("dashboard.analytics.trendUp");
const { url: analyticsTrendDownUrl } = useAssetUrl(
  "dashboard.analytics.trendDown",
);

defineEmits([
  "openSubscribersTrendPopup",
  "openEarningsTrendPopup",
  "openFansTrendPopup",
  "openLikesTrendPopup",
  "openContributorsTrendPopup",
  "refresh",
]);

function formatAnalyticsLastUpdatedAt(dateString) {
  if (!dateString) return "Never";
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
</script>
