/** @jsx figma.widget.h */
import { once, showUI } from "@create-figma-plugin/utilities";
import storyItems from "./storyItems";
import storySizes from "./storySizes";
import {
  editIcon,
  sizeIcon,
  calendarIcon,
  linkIcon,
  descriptionIcon,
} from "./storySVGs";
import { StoryData } from "./storyData";

const { widget } = figma;
const { AutoLayout, Text, SVG, useSyncedState, usePropertyMenu } = widget;

export default function () {
  widget.register(Storymapper);
}

function Storymapper() {
  const [text, setText] = useSyncedState("text", "Hello\nWidgets");

  const [storyItem, setStoryItem] = useSyncedState("storyItem", storyItems[0]);
  const [storySize, setStorySize] = useSyncedState("storySize", "medium");
  const [storyData, setStoryData] = useSyncedState("storyData", {
    title: "",
    description: "",
    date: "",
    link: "",
    tags: [],
    userImpact: 100,
    userValue: "",
    usability: "",
    ethicality: "",
    feasability: "",
    viability: "",
    score: "",
  } as StoryData);

  // Styling sizes
  const s = storySizes[storySize];

  // Property menu
  const propertyMenuItems: Array<WidgetPropertyMenuItem> = [
    {
      tooltip: "Edit",
      propertyName: "EDIT",
      itemType: "action",
      icon: editIcon,
    },
    {
      tooltip: "Change size",
      propertyName: "SIZE",
      itemType: "action",
      icon: sizeIcon,
    },
  ];
  storyItems.forEach((item) => {
    propertyMenuItems.push({
      tooltip: item.title,
      propertyName: item.type,
      itemType: "action",
      icon: item.icon,
    });
  });

  async function onChange({
    propertyName,
  }: WidgetPropertyEvent): Promise<void> {
    await new Promise<void>(function (resolve: () => void): void {
      if (propertyName === "EDIT") {
        showUI({ width: 400, height: 600 }, { storyData });
        once("UPDATE_STORY_ITEM", function (storyData: StoryData): void {
          setStoryData(storyData);
          resolve();
        });
      } else if (propertyName === "SIZE") {
        setStorySize(storySize === "medium" ? "small" : "medium");
        figma.closePlugin();
      } else {
        const updatedItem = storyItems.find((i) => i.type === propertyName);
        if (updatedItem) setStoryItem(updatedItem);
        figma.closePlugin();
      }
    });
  }
  usePropertyMenu(propertyMenuItems, onChange);

  const STYLE = {
    fontFamily: "Inter",
  };

  return (
    <AutoLayout
      padding={s.xs}
      width={s.vw}
      fill={"#FFFFFF"}
      cornerRadius={{
        topLeft: s.xl,
        topRight: s.xs,
        bottomLeft: s.xl,
        bottomRight: s.xs,
      }}
      spacing={s.md}
      stroke={storyItem.color.light}
      strokeWidth={2}
    >
      <SVG src={storyItem.icon} width={s.xxxl} height={s.xxxl}></SVG>
      <AutoLayout direction="vertical" spacing={s.xs} width="fill-parent">
        <AutoLayout
          spacing={storyData.score !== "" ? "auto" : 0}
          width="fill-parent"
        >
          <AutoLayout
            padding={{ vertical: s.xxs, horizontal: s.xs }}
            fill={storyItem.color.light}
            cornerRadius={s.xxs}
          >
            <Text
              fontSize={s.sm}
              fontFamily={STYLE.fontFamily}
              textCase="upper"
              fontWeight="medium"
            >
              {storyItem.title}
            </Text>
          </AutoLayout>
          <AutoLayout
            hidden={storyData.score === ""}
            padding={{ vertical: s.xxs, horizontal: s.md }}
            cornerRadius={s.xxs}
            stroke={storyItem.color.regular}
            strokeWidth={2}
          >
            <Text
              fontSize={s.sm}
              fontFamily={STYLE.fontFamily}
              textCase="upper"
              fontWeight="medium"
            >
              {storyData.score}
            </Text>
          </AutoLayout>
        </AutoLayout>
        <AutoLayout width="fill-parent" height="hug-contents">
          <Text
            hidden={storyData.title !== ""}
            onClick={() => onChange({ propertyName: "EDIT" })}
            fontSize={s.md}
            fontFamily={STYLE.fontFamily}
            width="fill-parent"
            height="hug-contents"
            fill="#999"
          >
            {storyItem.description}
          </Text>
          <Text
            hidden={storyData.title === ""}
            onClick={() => onChange({ propertyName: "EDIT" })}
            fontSize={s.lg}
            fontFamily={STYLE.fontFamily}
            width="fill-parent"
            height="hug-contents"
          >
            {storyData.title}
          </Text>
        </AutoLayout>
        <AutoLayout
          hidden={!storyData.tags || storyData.tags.length === 0}
          width="fill-parent"
          height="hug-contents"
          spacing={s.xxs}
        >
          {storyData.tags &&
            storyData.tags.map((tag, i) => {
              return (
                <AutoLayout
                  fill="#F3F3F3"
                  padding={{
                    top: s.xxxs,
                    bottom: s.xxxs,
                    left: s.xs,
                    right: s.xs,
                  }}
                  cornerRadius={s.xxs}
                  key={`tag-${i}`}
                >
                  <Text
                    fontSize={s.xs}
                    fontFamily={STYLE.fontFamily}
                    fill="#999"
                  >
                    {tag}
                  </Text>
                </AutoLayout>
              );
            })}
        </AutoLayout>
        <AutoLayout
          hidden={!storyData.date && !storyData.description && !storyData.link}
          spacing={storyData.date ? "auto" : 0}
          verticalAlignItems="center"
          horizontalAlignItems="end"
          width="fill-parent"
          height="hug-contents"
        >
          <AutoLayout
            hidden={!storyData.date}
            spacing={s.xxs}
            verticalAlignItems="center"
            height="hug-contents"
            width="fill-parent"
          >
            <SVG src={calendarIcon} width={s.lg} height={s.lg}></SVG>
            <Text fill="#999" fontSize={s.sm}>
              {storyData.date}
            </Text>
          </AutoLayout>
          <AutoLayout
            verticalAlignItems="center"
            hidden={!storyData.description && !storyData.link}
          >
            <SVG
              hidden={!storyData.description}
              onClick={() => onChange({ propertyName: "EDIT" })}
              src={descriptionIcon}
              width={s.lg}
              height={s.lg}
            ></SVG>
            <SVG
              hidden={!storyData.link}
              onClick={() =>
                figma.showUI(
                  `<script>window.open('${storyData.link}','_blank');</script>`,
                  { visible: false }
                )
              }
              src={linkIcon}
              width={s.lg}
              height={s.lg}
            ></SVG>
          </AutoLayout>
        </AutoLayout>
      </AutoLayout>
    </AutoLayout>
  );
}
