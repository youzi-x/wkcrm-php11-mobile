import { post } from '../utils/request'

export function getProjectList(data = {}) {
  return post('work/work/index', {
    sort_type: 1,
    ...data
  })
}

export function createProject(data = {}) {
  return post('work/work/save', {
    is_open: 0,
    cover_url: 'mobile-default-project-cover',
    ...data
  })
}

export function getProjectDetail(workId) {
  return post('work/work/read', {
    work_id: workId
  })
}

export function updateProject(data = {}) {
  return post('work/work/update', data)
}

export function getProjectTasks(data = {}) {
  return post('work/task/index', data)
}

export function searchProjectTasks(data = {}) {
  return post('work/task/search', {
    sort_type: 1,
    ...data
  })
}

export function createProjectTask(data = {}) {
  return post('work/task/save', data)
}

export function updateProjectTask(data = {}) {
  return post('work/task/update', data)
}

export function updateProjectTaskName(data = {}) {
  return post('work/task/updateName', {
    type: 'name',
    ...data
  })
}

export function updateProjectTaskPriority(data = {}) {
  return post('work/task/updatePriority', data)
}

export function updateProjectTaskTime(data = {}) {
  return post('work/task/updateStoptime', data)
}

export function getProjectTaskDetail(taskId) {
  return post('work/task/read', {
    task_id: taskId
  })
}

export function getProjectTaskLogs(taskId) {
  return post('work/task/readLoglist', {
    task_id: taskId
  })
}

export function addProjectTaskComment(data = {}) {
  return post('work/taskcomment/save', {
    type: 1,
    ...data
  })
}

export function renameProjectFile(data = {}) {
  return post('admin/file/update', data)
}

export function deleteProjectFile(data = {}) {
  return post('admin/file/delete', data)
}

export function toggleProjectTask(data = {}) {
  return post('work/task/taskOver', data)
}

export function archiveProjectTask(data = {}) {
  return post('work/task/archive', data)
}

export function recoverProjectTask(data = {}) {
  return post('work/task/recover', data)
}

export function createProjectTaskClass(data = {}) {
  return post('work/taskclass/save', data)
}

export function renameProjectTaskClass(data = {}) {
  return post('work/taskclass/rename', data)
}

export function deleteProjectTaskClass(data = {}) {
  return post('work/taskclass/delete', data)
}

export function getProjectStatistic(workId) {
  return post('work/work/statistic', {
    work_id: workId
  })
}

export function getProjectFiles(workId) {
  return post('work/work/fileList', {
    work_id: workId
  })
}

export function getArchivedProjectTasks(workId) {
  return post('work/task/archList', {
    work_id: workId
  })
}
