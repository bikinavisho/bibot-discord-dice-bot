const {log} = require('../logging-util.js');

function getCriteria(argument, rank) {
  // This represents the modifiers that are being used
  let criteriaStrings;
  try {
    criteriaStrings = argument.split(',');  // array of strings
  } catch (exception) {
    log('[[Exception thrown in parsing of argument into criteriaStrings]] ', exception)
    log('not enough arguments passed in')
    return;
  }
  //ENSURE THAT CRITERIA PASSED ARE NUMBERS!!
  let wasErrorThrown = false;
  let criteria = criteriaStrings.map((num) => {
    if (isNaN(Number(num))) {
      log('criteria passed is not a number');
      wasErrorThrown = true;
    }
    return Number(num);
  });
  if (wasErrorThrown) {
    return;
  }

  // if only one modifier is passed, and the rank is higher than one,
  // duplicate the modifier until rank requirement is filled
  if (criteria.length === 1 && rank > 1) {
    let i;
    for (i = 1; i < rank; i++) {
      criteria.push(criteria[0]);
    }
  } else if (criteria.length != rank) {
    let lastCriteria = criteria[criteria.length - 1];
    let diff = rank - criteria.length;
    let i;
    for (i = 0; i < diff; i++) {
      criteria.push(lastCriteria);
    }
  }

  return criteria;
}

function parseSuccessesString(successes) {
  return `${successes} Success${successes === 1 ? '' : 'es'}. `;
}

function parseCritSuccessString(criticalSuccesses) {
  if (criticalSuccesses > 0) {
    return `${criticalSuccesses} Critical Success${criticalSuccesses === 1 ? '' : 'es'}! `;
  } else {
    return '';
  }
}

function parseCritFailureString(criticalFailures) {
  if (criticalFailures > 0) {
    return `${criticalFailures} Critical Failure${criticalFailures === 1 ? '' : 's'}! `;
  } else {
    return '';
  }
}

const SKILL_CHECK_RESULTS = {
  CRITICAL_SUCCESS: 'CRITICAL_SUCCESS',
  SUCCESS: 'SUCCESS',
  NO_SUCCESS: 'NO_SUCCESS',
  CRITICAL_FAILURE: 'CRITICAL_FAILURE'
};

function skillCheck(num, threshold, skip150 = false) {
  if (threshold >= 150 && skip150) {
    // if skip auto successes is enabled and the number is correct,
    //           just return a success
    log('\tdice roll has been replaced with an auto success')
    return SKILL_CHECK_RESULTS.SUCCESS;
  }
  if (num <= 10) {
    return SKILL_CHECK_RESULTS.CRITICAL_SUCCESS;
  }
  if (threshold >= 100 && threshold <= 150 && num >= 90 && num != 100) {
    log('\tcrit fail cancelled by sufficiently high threshold');
    return SKILL_CHECK_RESULTS.NO_SUCCESS;
  }
  if (num >= 90) {
    return SKILL_CHECK_RESULTS.CRITICAL_FAILURE;
  }
  if (num <= threshold) {
    return SKILL_CHECK_RESULTS.SUCCESS;
  }
}


module.exports = {
  getCriteria, parseSuccessesString, parseCritSuccessString, parseCritFailureString,
  skillCheck, SKILL_CHECK_RESULTS
};
