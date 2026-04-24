import "./index.css";
import React from "react";
import { Composition, Folder } from "remotion";
import { MyComposition } from "./remotion/MyComposition/MyComposition";
import { AgentArchitecture, TOTAL_DURATION } from "./remotion/AgentArchitecture/AgentArchitecture";
import { NarratedAgentArchitecture, NARRATED_TOTAL_DURATION } from "./remotion/AgentArchitectureNarrated/AgentArchitectureNarrated";
import { NeuralNetworks, NEURAL_NETWORK_DURATION } from "./remotion/NeuralNetworks/NeuralNetworks";
import { PromptEngineering, PROMPT_ENGINEERING_DURATION } from "./remotion/PromptEngineering/PromptEngineering";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YT-VideoGen-Starter"
        component={MyComposition}
        durationInFrames={60}
        fps={30}
        width={1280}
        height={720}
      />
      <Folder name="AgentArchitecture">
        <Composition
          id="AgentArchitecture"
          component={AgentArchitecture}
          durationInFrames={TOTAL_DURATION}
          fps={30}
          width={1280}
          height={720}
        />
      </Folder>
      <Folder name="NarratedAgentArchitecture">
        <Composition
          id="NarratedAgentArchitecture"
          component={NarratedAgentArchitecture}
          durationInFrames={NARRATED_TOTAL_DURATION}
          fps={30}
          width={1280}
          height={720}
        />
      </Folder>
      <Folder name="NeuralNetworks">
        <Composition
          id="NeuralNetworks"
          component={NeuralNetworks}
          durationInFrames={NEURAL_NETWORK_DURATION}
          fps={30}
          width={1280}
          height={720}
        />
      </Folder>
      <Folder name="PromptEngineering">
        <Composition
          id="PromptEngineering"
          component={PromptEngineering}
          durationInFrames={PROMPT_ENGINEERING_DURATION}
          fps={30}
          width={1280}
          height={720}
        />
      </Folder>
    </>
  );
};
