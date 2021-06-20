import EventEmitter from 'events'

class Candidate {
  /**
   * @type {string}
   */
  #name = null

  /**
   * @type {string[]}
   */
  #competencies = []

  /**
   * @param {string} name
   * @param {string[]} competencies
   */
  constructor(name, competencies = []) {
    this.#name = name
    this.#competencies = this.#competencies.concat(competencies)
  }

  get name() {
    return this.#name
  }

  get competencies() {
    return this.#competencies
  }
}

class CollectionOfCandidates {
  /**
   * @type {Candidate[]}
   */
  #candidates = []

  /**
   * @param {Candidate} candidate
   */
  register(candidate) {
    this.#candidates.push(candidate)
  }

  /**
   * @param {string} competency
   */
  findByCompetency(competency) {
    return this.#candidates.find(candidate => candidate.competencies.includes(competency))
  }

  /**
   * @param {string[]} competencies
   */
  findByCompetencies(competencies) {
    return this.#candidates.find(
      candidate => competencies.every(competency => candidate.competencies.includes(competency))
    )
  }
}

class Headhunter extends EventEmitter {
  candidates = new CollectionOfCandidates()

  searchForCandidates() {
    this.register(new Candidate('John Doe', [ 'javascript', 'html', 'css' ]))
    this.register(new Candidate('Jane Smith', [ 'ruby', 'rubyonrails' ]))
  }

  /**
   * @param {Candidate} candidate
   */
  register(candidate) {
    this.candidates.register(candidate)
    this.emit('candidate-registered', candidate)
  }

  /**
   * @param {string[]} competencies
   */
  findMatch(competencies) {
    const candidate = this.candidates.findByCompetency(competencies[0])
    this.summarizeCandidateMatching(candidate, competencies)

    return candidate
  }

  /**
   *
   * @param {Candidate} candidate
   * @param {string[]} competencies
   */
  summarizeCandidateMatching(candidate, competencies) {
    if (candidate) {
      this.notifyCandidateMatched(candidate, competencies)
    } else {
      this.notifyCandidateNoCandidateMatched(competencies)
    }
  }

  /**
   * @param {Candidate} candidate
   */
  notifyCandidateMatched(candidate, competencies) {
    this.emit('candidate-matched', candidate, competencies)
  }

  /**
   * @param {string[]} competencies
   */
  notifyCandidateNoCandidateMatched(competencies) {
    this.emit('candidate-not-found', competencies)
  }
}

class PerfectHeadhunter extends Headhunter {
  /**
   * @param {string[]} competencies
   */
  findMatch(competencies) {
    const candidate = this.candidates.findByCompetencies(competencies)
    this.summarizeCandidateMatching(candidate, competencies)

    return candidate
  }
}

class Company extends EventEmitter {
  /**
   * @type {string}
   */
  #name

  /**
   * @type {Employee[]}
   */
  #employees = []

  /**
   * @param {string} name
   * @param {Employee[]} employees
   */
  constructor(name, employees) {
    super()
    this.#name = name
    this.#employees = this.#employees.concat(employees)
  }

  /**
   * @param {Candidate} candidate
   * @param {string[]} competencies
   */
  verify(candidate, competencies) {
    return competencies.every(competency => candidate.competencies.includes(competency))
  }

  /**
   * @param {Candidate} candidate
   * @param {string} position
   */
  hire(candidate, position) {
    const employee = new Employee(candidate.name, position)
    this.#employees.push(employee)

    this.emit('employee-hired', employee)
    employee.hired(this)

    return employee
  }

  /**
   * @param {Employee} employee
   */
  terminate(employee) {
    this.#employees = this.#employees.filter(e => e !== employee)

    this.emit('employee-terminated', employee)
    employee.terminate(this)
  }

  get name() {
    return this.#name
  }

  get employees() {
    return this.#employees.map(employee => employee.name)
  }
}

class Employee extends EventEmitter {
  /**
   * @type {string}
   */
  #name = null

  /**
   * @type {string}
   */
  #position = null

  /**
   * @param {string} name
   * @param {string} position
   */
  constructor(name, position) {
    super()
    this.#name = name
    this.#position = position
  }

  get name() {
    return this.#name
  }

  get position() {
    return this.#position
  }

  /**
   * @param {Company} company
   */
  hired(company) {
    this.emit('hired-by', company)
  }

  /**
   * @param {Company} company
   */
  terminated(company) {
    this.emit('terminated-by', company)
  }
}

class HiringProcess {
  /**
   * @type {Headhunter}
   */
  #headhunter

  /**
   * @type {Company}
   */
  #company

  /**
   * @param {Headhunter} headhunter
   * @param {Company} company
   */
  constructor(headhunter, company) {
    this.#headhunter = headhunter
    this.#company = company
  }

  /**
   * @param {string} position
   * @param {string[]} competencies
   */
  execute(position, competencies) {
    const candidate = this.#headhunter.findMatch(competencies)
    if (candidate && this.#company.verify(candidate, competencies)) {
      return this.#company.hire(candidate, position)
    } else {
      return null
    }
  }
}

export async function start() {
  const candidates = [
    { name: 'John Doe', competencies: [ 'javascript', 'html', 'css' ] },
    { name: 'Jane Smith', competencies: [ 'ruby', 'rubyonrails' ] },
  ]

  const expectedCompetencies = [ 'html', 'css' ]

  const match = candidates.find(candidate =>
    expectedCompetencies.every(competency => candidate.competencies.includes(competency))
  )

  console.log('Match:', match)

  const headhunter = new Headhunter()

  headhunter.on('candidate-registered', candidate => {
    console.log('Candidate registered', candidate)
  })
  headhunter.on('candidate-matched', (candidate, competencies) => {
    console.log('Candidate matched', candidate, competencies)
  })
  headhunter.on('candidate-not-found', competencies => {
    console.log('Candidate not found for', competencies)
  })

  headhunter.searchForCandidates()

  const company = new Company('The Best Brothers', [
    new Employee('Robert Dringer', 'CEO'),
    new Employee('Frank Dringer', 'CFO'),
    new Employee('Mark Twain', 'Head software writer'),
  ])

  company.on('employee-hired', employee => {
    console.log('Company hired', employee)
  })

  const position = 'web-designer'
  const competencies = [ 'html', 'css' ]

  const hiringProcess = new HiringProcess(headhunter, company)
  const employee = hiringProcess.execute(position, competencies)

  if (employee) {
    console.log('Congratulations', employee.name, 'the', employee.position, '!')
  } else {
    console.log('Sorry..')
  }
  console.log('Current list of employees:', company.employees.join(', '))
}
