// import * as stem from 'stemmer'
// import * as natural from 'natural'



// function getStemmedWords(inputText: string) {
//   return natural.PorterStemmer.stem(inputText)
// }


// console.log(getStemmedWords(`inspired`))


import {
  Entity,
  EntityType,
  // groupSingleLetters,
  tokenize,
} from './textUtils'

const str = ` 
 For more information, see Chapter 3.4.5.1`;

const str2 = `I said. ————-Thanks for reading———- - Be Literate -Can be first or third - this is B.I.T.C.H.  and also B I T C H John's FuckingBitch step bro x step sis, no`;

// - split by whitespace
// - group isolated character of 3 or more together
// - Remove punctuation
// - ignore single chars

console.log(tokenize(str2))
// console.log('------')
// console.log(groupSingleLetters(tokenize(str2)).filter((e: Entity) => e.type === EntityType.word || e.type === EntityType.letter))
