export enum EntityType {
  whitespace = 'whitespace',
  word = 'word',
  letter = 'letter',
  punctuation = 'punctuation',
  number = 'number', // not used right now
  letterGroup = 'letterGroup',
}

export interface Entity {
  original: string,
  normalized: string,
  type: EntityType,
  index: number,
}

const punctuationChars = `.,;:\\?\\!\\-\\—\\(\\)\\[\\]\\{\\}'"`

const splitGeneral = (regex: RegExp, inputText: string, firstType: EntityType, secondType: EntityType) => {
  const arr: Entity[] = []

  let found

  do {
    found = regex.exec(inputText)
    if (found && found[0].length > 0) {

      if (found[1]) {
        arr.push({
          original: found[1],
          normalized: found[1],
          type: firstType,
          index: found.index,
        })
      }

      if (found[2]) {
        arr.push({
          original: found[2],
          normalized: found[2],
          type: secondType,
          index: found.index + (found[1] ? found[1].length : 0),
        })
      }
    }
  }
  while (found && found[0].length > 0)

  return arr
}

/**
 * Splits input text by any whitespace or group of whitespace characters. These whitespace
 * parts of the strings are also kept in the resulting array so it would be possible
 * to reconstruct original input text.
 * @param inputText
 */
const splitByWhitespace = (inputText: string) => {
  return splitGeneral(/([^\s]+)?(\s+)?/gm, inputText, EntityType.word, EntityType.whitespace)
}

/**
 * Splits input text by any punctuation character or group of such characters. These
 * parts of the strings are also kept in the resulting array so it would be possible
 * to reconstruct original input text.
 * @param inputText
 */
const splitByPunctuation = (inputText: string) => {
  const regex = new RegExp(`([^\\s${punctuationChars}]+)?([${punctuationChars}]+)?`, 'gm')
  return splitGeneral(regex, inputText, EntityType.word, EntityType.punctuation)
}

const joinEntities = (entities: Entity[]) => {
  if (entities.length <= 1) {
    return entities
  }

  let indexOfLastLetter = -1
  const numberOfLetters = entities.reduce((acc, current, index) => {
    const isLetter = current.type === EntityType.letter
    if (isLetter) {
      indexOfLastLetter = index
    }
    return isLetter ? (acc + 1) : acc
  }, 0)

  if (numberOfLetters < 3) {
    return entities
  }

  const letters = entities.slice(0, indexOfLastLetter + 1)
  const reminder = entities.slice(indexOfLastLetter + 1)

  const groupedLetters: Entity = letters.reduce((acc, current) => {
    return {
      ...acc,
      original: `${acc.original}${current.original}`,
      normalized: `${acc.normalized}${(current.type === EntityType.letter) ? current.normalized : ''}`
    }
  }, { type: EntityType.word, original: '', normalized: '', index: letters[0].index } )

  return [groupedLetters, ...reminder]
}

const groupSingleLetters = (entities: Entity[]) => {

  let buffer: Entity[] = []

  const result = entities.reduce((acc: Entity[], current) => {
    if (current.type === EntityType.word) {
      // consolidovat buffer a připojit ho k acc a vrátit
      const joinedBuffer = joinEntities(buffer)
      buffer.length && console.log('buffer joined', joinedBuffer)
      const newAcc = [...acc, ...joinedBuffer, current]
      buffer = []
      return newAcc
    }

    if (current.type === EntityType.letter) {
      // přidat do bufferu, acc vrátit beze změny
      buffer.push(current)
      return acc
    }

    // anything else:
    if (buffer.length > 0) {
      // přidat do bufferu, acc vrátit beze změny
      buffer.push(current)
      return acc
    } else {
      return [...acc, current]
      // Přidat do acc a vrátit
    }
  }, [])

  return [...result, ...joinEntities(buffer)]
}

/**
 * Tokenizes input text by breaking it into array of categorized elements that can be later
 * analysed.
 * @param inputText
 */
export const tokenize = (inputText: string) => {

  // break input text into array of words and whitespaces
  const arr = splitByWhitespace(inputText)

  // break every word in the array further into words and punctuation
  const arrX = arr.reduce((acc: Entity[], current: Entity) => {
    if (current.type === EntityType.word) {
      const arr2 = splitByPunctuation(current.original)
      if (arr2.length > 1) {
        return acc.concat(arr2.map((entity) => ({ ...entity, index: current.index + entity.index })))
      }
    }
    return acc.concat([current])
  }, [])

  // go over the array word containing just single character is converted into letter
  const arrY = arrX.map((entity: Entity) => {
      if (entity.type !== EntityType.word || entity.original.length > 1) {
        return entity
      }
      return {
        ...entity,
        type: EntityType.letter
      }
    })

  // Analyse array of tokens and if it finds a group of consecutive single letters (like C R A P)
  // or C.R.A.P, it will join those together so they could be analysed as well.
  return groupSingleLetters(arrY)
}
