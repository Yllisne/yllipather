// Library of emote .pap file names to friendly names
// Add more mappings as needed
const emote_terms = {
    "idle": ["idle", "pose"],
    "loop": ["lp", "loop", "2lp"]
}

const emote_map = {
  '': ['not found, keep assignments'],
  'chara/human/c0101/animation/a0001/bt_common/emote/j_pose01_loop.pap': ['gsit1 loop'],
  'chara/human/c0101/animation/a0001/bt_common/emote/j_pose02_loop.pap': ['gsit2 loop'],
  'chara/human/c0101/animation/a0001/bt_common/emote/j_pose03_loop.pap': ['gsit3 loop'],
  'chara/human/c0101/animation/a0001/bt_common/emote/j_pose01_start.pap': ['gsit2 start'],
  'chara/human/c0101/animation/a0001/bt_common/emote/j_pose02_start.pap': ['gsit2 start'],
  'chara/human/c0101/animation/a0001/bt_common/emote/j_pose03_start.pap': ['gsit3 start'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose01_loop.pap": ['idle1 loop','cbem_pose01_2lp'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose02_loop.pap": ['idle2 loop','cbem_pose02_2lp'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose03_loop.pap": ['idle3 loop','cbem_pose03_2lp'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose04_loop.pap": ['idle4 loop','cbem_pose04_2lp'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose05_loop.pap": ['idle5 loop','cbem_pose05_2lp'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose06_loop.pap": ['idle6 loop','cbem_pose06_2lp'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose01_start.pap": ['idle1 start','cbem_pose01_1'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose02_start.pap": ['idle2 start','cbem_pose02_1'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose03_start.pap": ['idle3 start','cbem_pose03_1'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose04_start.pap": ['idle4 start','cbem_pose04_1'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose05_start.pap": ['idle5 start','cbem_pose05_1'],
  "chara/human/c0101/animation/a0001/bt_common/emote/pose06_start.pap": ['idle6 start','cbem_pose06_1'],
  "chara/human/c0101/animation/a0001/bt_common/emote/sit.pap": ['chsit0'],
  "chara/human/c0101/animation/a0001/bt_common/emote/s_pose01_loop.pap": ['chsit1 loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote/s_pose02_loop.pap": ['chsit2 loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote/s_pose03_loop.pap": ['chsit3 loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote/s_pose01_start.pap": ['chsit1 start'],
  "chara/human/c0101/animation/a0001/bt_common/emote/s_pose02_start.pap": ['chsit2 start'],
  "chara/human/c0101/animation/a0001/bt_common/emote/s_pose03_start.pap": ['chsit3 start'],
  "chara/human/c0101/animation/a0001/bt_common/emote/loop_emot17_loop.pap": ['sweat loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote/loop_emot17_start.pap": ['sweat start'],
  "chara/human/c0101/animation/a0001/bt_common/emote/loop_emot20_loop.pap": ['confirm loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote/loop_emot20_start.pap": ['confirm start'],
  "chara/human/c0101/animation/a0001/bt_common/emote/loop_emot23_loop.pap": ['lean loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote/loop_emot23_start.pap": ['lean start'],
  "chara/human/c0101/animation/a0001/bt_common/emote_sp/sp72_loop.pap": ['sp72 loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote_sp/sp72_start.pap": ['sp72 start'],  
  "chara/human/c0101/animation/a0001/bt_common/emote_sp/sp72_uldaha_loop.pap": ['sp72 uldaha loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote_sp/sp72_uldaha_start.pap": ['sp72 uldaha start'],
  "chara/human/c0101/animation/a0001/bt_common/emote_sp/sp72_limsa_loop.pap": ['sp72 limsa loop'],
  "chara/human/c0101/animation/a0001/bt_common/emote_sp/sp72_limsa_start.pap": ['sp72 limsa start'],
};

// Export for module usage (uncomment if using modules)
// export default emotePapNames;
