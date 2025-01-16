//ts-expect-error
import React, { type ComponentType, type ReactNode } from "@moonlight-mod/wp/react";
import { useState } from "@moonlight-mod/wp/react";
//@ts-expect-error
import { UserMention } from "@moonlight-mod/wp/discord/components/common/index";
import { UserStore, UserProfileStore } from "@moonlight-mod/wp/common_stores";
import Dispatcher from "@moonlight-mod/wp/discord/Dispatcher";
import spacepack from "@moonlight-mod/wp/spacepack_spacepack";

import { HTTP as RestAPI } from "@moonlight-mod/wp/discord/utils/HTTPUtils";
const { Endpoints, UserFlags } = spacepack.require("discord/Constants");
const fetching = new Set<string>();

interface ProfileBadge {
  id: string;
  description: string;
  icon: string;
  link?: string;
}

interface MentionProps {
  data: {
    userId?: string;
    channelId?: string;
    content: any;
  };
  parse: (content: any, props: MentionProps["props"]) => ReactNode;
  props: {
    key: string;
    formatInline: boolean;
    noStyleAndInteraction: boolean;
  };
  RoleMention: ComponentType<any>;
  UserMention: ComponentType<any>;
}

const badges: Record<string, ProfileBadge> = {
  active_developer: {
    id: "active_developer",
    description: "Active Developer",
    icon: "6bdc42827a38498929a4920da12695d9",
    link: "https://support-dev.discord.com/hc/en-us/articles/10113997751447"
  },
  bug_hunter_level_1: {
    id: "bug_hunter_level_1",
    description: "Discord Bug Hunter",
    icon: "2717692c7dca7289b35297368a940dd0",
    link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs"
  },
  bug_hunter_level_2: {
    id: "bug_hunter_level_2",
    description: "Discord Bug Hunter",
    icon: "848f79194d4be5ff5f81505cbd0ce1e6",
    link: "https://support.discord.com/hc/en-us/articles/360046057772-Discord-Bugs"
  },
  certified_moderator: {
    id: "certified_moderator",
    description: "Moderator Programs Alumni",
    icon: "fee1624003e2fee35cb398e125dc479b",
    link: "https://discord.com/safety"
  },
  discord_employee: {
    id: "staff",
    description: "Discord Staff",
    icon: "5e74e9b61934fc1f67c65515d1f7e60d",
    link: "https://discord.com/company"
  },
  get staff() {
    return this.discord_employee;
  },
  hypesquad: {
    id: "hypesquad",
    description: "HypeSquad Events",
    icon: "bf01d1073931f921909045f3a39fd264",
    link: "https://discord.com/hypesquad"
  },
  hypesquad_online_house_1: {
    id: "hypesquad_house_1",
    description: "HypeSquad Bravery",
    icon: "8a88d63823d8a71cd5e390baa45efa02",
    link: "https://discord.com/settings/hypesquad-online"
  },
  hypesquad_online_house_2: {
    id: "hypesquad_house_2",
    description: "HypeSquad Brilliance",
    icon: "011940fd013da3f7fb926e4a1cd2e618",
    link: "https://discord.com/settings/hypesquad-online"
  },
  hypesquad_online_house_3: {
    id: "hypesquad_house_3",
    description: "HypeSquad Balance",
    icon: "3aa41de486fa12454c3761e8e223442e",
    link: "https://discord.com/settings/hypesquad-online"
  },
  partner: {
    id: "partner",
    description: "Partnered Server Owner",
    icon: "3f9748e53446a137a052f3454e2de41e",
    link: "https://discord.com/partners"
  },
  premium: {
    id: "premium",
    description: "Subscriber",
    icon: "2ba85e8026a8614b640c2837bcdfe21b",
    link: "https://discord.com/settings/premium"
  },
  premium_early_supporter: {
    id: "early_supporter",
    description: "Early Supporter",
    icon: "7060786766c9c840eb3019e725d2b358",
    link: "https://discord.com/settings/premium"
  },
  verified_developer: {
    id: "verified_developer",
    description: "Early Verified Bot Developer",
    icon: "6df5892e0f35b051f8b61eace34f4967"
  }
};

function isNonNullish<T>(item: T): item is Exclude<T, null | undefined> {
  return item != null;
}

async function getUser(id: string) {
  let userObj = UserStore.getUser(id);
  if (userObj) return userObj;

  const user: any = await RestAPI.get({ url: Endpoints.USER(id) }).then((response) => {
    Dispatcher.dispatch({
      type: "USER_UPDATE",
      user: response.body
    });

    return response.body;
  });

  // Populate the profile
  await Dispatcher.dispatch({
    type: "USER_PROFILE_FETCH_FAILURE",
    userId: id
  });

  userObj = UserStore.getUser(id);
  const fakeBadges: ProfileBadge[] = Object.entries(UserFlags)
    //@ts-expect-error
    .filter(([_, flag]) => !isNaN(flag) && userObj.hasFlag(flag))
    .map(([key]) => badges[key.toLowerCase()])
    .filter(isNonNullish);
  if (user.premium_type || (!user.bot && (user.banner || user.avatar?.startsWith?.("a_"))))
    fakeBadges.push(badges.premium);

  // Fill in what we can deduce
  const profile = UserProfileStore.getUserProfile(id);
  profile.accentColor = user.accent_color;
  profile.badges = fakeBadges;
  profile.banner = user.banner;
  profile.premiumType = user.premium_type;

  return userObj;
}

export function MentionWrapper({ data, UserMention, RoleMention, parse, props }: MentionProps) {
  const [userId, setUserId] = useState(data.userId);

  // if userId is set it means the user is cached. Uncached users have userId set to undefined
  if (userId)
    return (
      <UserMention
        className="mention"
        userId={userId}
        channelId={data.channelId}
        inlinePreview={props.noStyleAndInteraction}
        key={props.key}
      />
    );

  // Parses the raw text node array data.content into a ReactNode[]: ["<@userid>"]
  const children = parse(data.content, props);

  return (
    // Discord is deranged and renders unknown user mentions as role mentions
    <RoleMention {...data} inlinePreview={props.formatInline}>
      <span
        onClick={() => {
          const mention = children?.[0]?.props?.children;
          if (typeof mention !== "string") return;

          const id = mention.match(/<@!?(\d+)>/)?.[1];
          if (!id) return;

          // if (fetching.has(id)) return;

          if (UserStore.getUser(id)) return setUserId(id);

          const fetch = () => {
            fetching.add(id);

            getUser(id)
              .then(() => {
                setUserId(id);
                fetching.delete(id);
              })
              .catch((e) => {
                if (e?.status === 429) {
                  fetching.delete(id);
                }
              });
          };

          fetch();
        }}
      >
        {children}
      </span>
    </RoleMention>
  );
}

export default function renderMention(RoleMention: any, UserMention: any, data: any, parse: any, props: any) {
  console.log(data, UserMention, RoleMention);
  return (
    <MentionWrapper
      key={"mention" + data.userId}
      RoleMention={RoleMention}
      UserMention={UserMention}
      data={data}
      parse={parse}
      props={props}
    />
  );
}
