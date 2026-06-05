import React, { useState } from "react";
import SpeechBubbleImage from "./SpeechBubbleImage";

import gp1 from "../images/gp1.png";
import gp2 from "../images/gp2.png";
import gp3 from "../images/gp3.png";
import gp4 from "../images/gp4.png";
import gp5 from "../images/gp5.png";
import gp6 from "../images/gp6.png";

import Lspeakline from "./Lspeakline";

const Lgreenplants = () => {

  const [page, setPage] = useState(1);

  return (
    <div>

      {/* PAGE 1 */}
      {page === 1 && (
        <SpeechBubbleImage
          lessonImg={gp1}
          customText={`
            chapter preview.
Plants make food.
Plants use food to grow and live.

what will you learn?.
About parts of a leaf.
How plants make food.
How plants use their food.
How plants and animals depend on each other.
`}
          showNext={true}
          onNext={() => setPage(2)}
        />
      )}

      {/* PAGE 2 */}
      {page === 2 && (
        <SpeechBubbleImage
          lessonImg={gp2}
          customText={`
            Parts of a leaf.
Most leaves have three main external parts:
stalk, leaf blade, and veins. Let us learn about these parts.

STALK
The part of a leaf .that attaches the leaf to the stem. is called the stalk.

VEINS
Fine lines seen on the leaf blade. are called veins.
The thick vein in the middle of the leaf. is called the midrib.

In many leaves, thin side veins. branch out from the midrib and cover the leaf blade.

In some leaves, side veins run parallel to the midrib.

LEAF BLADE
The flat part of the leaf is called the leaf blade.

The underside of the leaf has tiny small openings .called stomata.

("Stomata" is a plural noun. Its singular form is stoma.)
`}
     
showNext={true}
          onNext={() => setPage(3)}
/>
        
      )}
      {page === 3 && (
        <SpeechBubbleImage
          lessonImg={gp3}
          customText={`
Photosynthesis means a process by which green plants use .
sunlight to make food and release oxygen into the air. 
Let us see what happens during this process.
`}
showNext={true}
          onNext={() => setPage(4)}     

/>
      )}
      {page === 4 && (
        <SpeechBubbleImage
          lessonImg={gp4}
          customText={`
Roots of the plant take water and minerals from the soil, which move upward /through the stem to the leaves.
Leaves take carbon dioxide from the air. through tiny openings. called stomata.
Chlorophyll present in the leaves .absorbs energy from sunlight.
Using sunlight, water, and carbon dioxide, plants prepare food and release oxygen into the air.
`}
showNext={true}
          onNext={() => setPage(5)}   
        />
      )}
      {page === 5 && (
        <SpeechBubbleImage
          lessonImg={gp5}
          customText={`
Food chain: When herbivores (plant-eating
animals) eat plants, food from plants gets
transferred to the body of herbivores. When carnivores (flesh-eating animals) eat
herbivores, food from herbivores gets transferred to the body of carnivores. A chain
seen in nature. by which food is transferred from one living thing to another is called a
f ood chain.
A food chain always begins with a plant. Plants make their own food. So, plants are known
as producers. Animals consume or eat plants. So, animals are known as consumers.
A food chain can also be called a chain that shows how producers and consumers
depend on each other for food.
`}
showNext={true}
          onNext={() => setPage(6)}  
        />
      )}
      {page === 6 && (
        <SpeechBubbleImage
          lessonImg={gp6}
          customText={`
Germination is the process by which a seed .begins to grow into a new plant.
with help of air, water and sunlight.
`}
        />
      )}
{/* 
      {page === 2 && (
        <SpeechBubbleImage
          lessonImg={gp2}
          customText={`

`}
        />
      )} */}

{/* <Lspeakline></Lspeakline> */}
    </div>
  );
};

export default Lgreenplants;